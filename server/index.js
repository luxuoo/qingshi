const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { pool, initDB } = require('./db');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'qingshiyue_secret_2024';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '未登录' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: '登录已过期' });
    }
}

// ========== 用户 ==========
app.post('/api/register', async (req, res) => {
    try {
        const { username, phone, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: '用户名和密码必填' });

        const [exists] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (exists.length) return res.status(400).json({ error: '用户名已存在' });

        if (phone) {
            const [phoneExists] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
            if (phoneExists.length) return res.status(400).json({ error: '手机号已注册' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (username, phone, password) VALUES (?, ?, ?)', [username, phone || null, hashed]);

        const token = jwt.sign({ id: result.insertId, username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: result.insertId, username, phone } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (!rows.length) return res.status(400).json({ error: '用户名或密码错误' });

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: '用户名或密码错误' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username, phone: user.phone } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, phone, created_at FROM users WHERE id = ?', [req.user.id]);
        res.json(rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== 饮食计划 ==========
app.get('/api/diet-plans', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM diet_plans WHERE user_id = ? ORDER BY FIELD(day_of_week, "周一","周二","周三","周四","周五","周六","周日"), FIELD(meal_type, "breakfast","lunch","dinner")', [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/diet-plans', authMiddleware, async (req, res) => {
    try {
        const { day_of_week, meal_type, food_name, calories, amount, image } = req.body;
        const [result] = await pool.query(
            'INSERT INTO diet_plans (user_id, day_of_week, meal_type, food_name, calories, amount, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, day_of_week, meal_type, food_name, calories || 0, amount || '', image || '']
        );
        res.json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/diet-plans/:id', authMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM diet_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== 打卡 ==========
app.get('/api/checkins', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC', [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/checkins', authMiddleware, async (req, res) => {
    try {
        const { checkin_date, day_of_week, calories } = req.body;
        await pool.query(
            'INSERT INTO checkins (user_id, checkin_date, day_of_week, calories) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE calories = VALUES(calories), checked = 1',
            [req.user.id, checkin_date, day_of_week, calories || 0]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/checkins/:date', authMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM checkins WHERE user_id = ? AND checkin_date = ?', [req.user.id, req.params.date]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== 社区帖子 ==========
app.get('/api/posts', async (req, res) => {
    try {
        const { tag, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let sql = `SELECT p.*, u.username as author,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
            FROM posts p JOIN users u ON p.user_id = u.id`;
        const params = [];
        if (tag && tag !== 'all') { sql += ' WHERE p.tag = ?'; params.push(tag); }
        sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
    try {
        const { title, content, tag, image } = req.body;
        if (!title || !content) return res.status(400).json({ error: '标题和内容必填' });
        const [result] = await pool.query(
            'INSERT INTO posts (user_id, title, content, tag, image) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, title, content, tag || '分享', image || null]
        );
        res.json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts/:id/like', authMiddleware, async (req, res) => {
    try {
        const postId = req.params.id;
        const [exists] = await pool.query('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, req.user.id]);
        if (exists.length) {
            await pool.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, req.user.id]);
            res.json({ liked: false });
        } else {
            await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, req.user.id]);
            res.json({ liked: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/posts/:id/liked', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ liked: rows.length > 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== 评论 ==========
app.get('/api/posts/:id/comments', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT c.*, u.username as author,
                (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as like_count
             FROM comments c JOIN users u ON c.user_id = u.id
             WHERE c.post_id = ? AND c.parent_id IS NULL
             ORDER BY c.created_at DESC`, [req.params.id]
        );

        for (let comment of rows) {
            const [replies] = await pool.query(
                `SELECT c.*, u.username as author,
                    (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as like_count
                 FROM comments c JOIN users u ON c.user_id = u.id
                 WHERE c.parent_id = ?
                 ORDER BY c.created_at ASC`, [comment.id]
            );
            comment.replies = replies;
        }

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts/:id/comments', authMiddleware, async (req, res) => {
    try {
        const { content, parent_id } = req.body;
        if (!content) return res.status(400).json({ error: '评论内容必填' });
        const [result] = await pool.query(
            'INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)',
            [req.params.id, req.user.id, parent_id || null, content]
        );
        res.json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/comments/:id/like', authMiddleware, async (req, res) => {
    try {
        const commentId = req.params.id;
        const [exists] = await pool.query('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, req.user.id]);
        if (exists.length) {
            await pool.query('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, req.user.id]);
            res.json({ liked: false });
        } else {
            await pool.query('INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)', [commentId, req.user.id]);
            res.json({ liked: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/comments/:id/liked', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ liked: rows.length > 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 首页 fallback
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

async function start() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

start();
