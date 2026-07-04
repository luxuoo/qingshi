/**
 * 轻食悦膳 - 数据模块
 * 包含食谱、食材、营养数据等完整模拟数据
 */

// 食谱数据（扩充至20+）
const RecipeData = [
    {
        id: 1, name: '藜麦鸡胸肉沙拉', category: '减脂', difficulty: '简单',
        cookingTime: 25, calories: 320, servings: 2,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1PW411T7YB&autoplay=0',
        ingredients: [
            { name: '鸡胸肉', amount: 150, unit: 'g' }, { name: '藜麦', amount: 100, unit: 'g' },
            { name: '生菜', amount: 100, unit: 'g' }, { name: '小番茄', amount: 80, unit: 'g' },
            { name: '黄瓜', amount: 100, unit: 'g' }, { name: '橄榄油', amount: 10, unit: 'ml' }
        ],
        nutrition: { protein: 28, carbs: 35, fat: 12, fiber: 8 },
        steps: [
            { title: '准备食材', desc: '鸡胸肉切块，用少许盐和黑胡椒腌制10分钟。藜麦洗净备用。' },
            { title: '煮藜麦', desc: '藜麦加水煮15分钟至熟透，沥干水分放凉。' },
            { title: '煎鸡胸肉', desc: '平底锅加少许橄榄油，将鸡胸肉煎至两面金黄，熟透后切片。' },
            { title: '准备蔬菜', desc: '生菜洗净撕成小片，小番茄对半切，黄瓜切片。' },
            { title: '组装沙拉', desc: '将所有食材放入大碗中，淋上橄榄油和柠檬汁，轻轻拌匀即可。' }
        ],
        tags: ['减脂', '高蛋白', '低卡']
    },
    {
        id: 2, name: '香煎三文鱼配西蓝花', category: '增肌', difficulty: '简单',
        cookingTime: 20, calories: 420, servings: 1,
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1QU4y1j7T4&autoplay=0',
        ingredients: [
            { name: '三文鱼', amount: 200, unit: 'g' }, { name: '西蓝花', amount: 150, unit: 'g' },
            { name: '柠檬', amount: 1, unit: '个' }, { name: '橄榄油', amount: 15, unit: 'ml' },
            { name: '黑胡椒', amount: 2, unit: 'g' }, { name: '盐', amount: 1, unit: 'g' }
        ],
        nutrition: { protein: 35, carbs: 12, fat: 22, fiber: 6 },
        steps: [
            { title: '准备食材', desc: '三文鱼洗净吸干水分，两面撒盐和黑胡椒。' },
            { title: '煎三文鱼', desc: '平底锅加橄榄油，中火煎3-4分钟至金黄，翻面再煎2-3分钟。' },
            { title: '处理西蓝花', desc: '西蓝花切小朵，焯水2分钟至断生，沥干。' },
            { title: '摆盘', desc: '三文鱼放盘中，旁边摆西蓝花，挤柠檬汁即可。' }
        ],
        tags: ['增肌', '高蛋白', 'Omega-3']
    },
    {
        id: 3, name: '南瓜山药养生粥', category: '养胃', difficulty: '简单',
        cookingTime: 40, calories: 180, servings: 2,
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV15gtKeBERk&autoplay=0',
        ingredients: [
            { name: '南瓜', amount: 200, unit: 'g' }, { name: '山药', amount: 150, unit: 'g' },
            { name: '大米', amount: 100, unit: 'g' }, { name: '枸杞', amount: 10, unit: 'g' },
            { name: '冰糖', amount: 20, unit: 'g' }
        ],
        nutrition: { protein: 6, carbs: 38, fat: 2, fiber: 4 },
        steps: [
            { title: '准备食材', desc: '南瓜去皮切块，山药去皮切块，大米洗净。' },
            { title: '煮粥', desc: '大米加水煮开，转小火煮20分钟至米粒开花。' },
            { title: '加入食材', desc: '加入南瓜和山药，继续煮15分钟至软烂。' },
            { title: '调味', desc: '加入枸杞和冰糖，搅拌均匀至融化即可。' }
        ],
        tags: ['养胃', '易消化', '低脂']
    },
    {
        id: 4, name: '全麦三明治配牛油果', category: '低卡', difficulty: '简单',
        cookingTime: 10, calories: 350, servings: 1,
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1BE411B7dK&autoplay=0',
        ingredients: [
            { name: '全麦面包', amount: 2, unit: '片' }, { name: '牛油果', amount: 1, unit: '个' },
            { name: '鸡蛋', amount: 1, unit: '个' }, { name: '生菜', amount: 30, unit: 'g' },
            { name: '番茄', amount: 50, unit: 'g' }
        ],
        nutrition: { protein: 15, carbs: 32, fat: 18, fiber: 8 },
        steps: [
            { title: '准备食材', desc: '牛油果去核压泥，鸡蛋煮熟切片。' },
            { title: '组装三明治', desc: '面包抹牛油果泥，放生菜、番茄、鸡蛋。' },
            { title: '完成', desc: '盖上面包，对角切开即可。' }
        ],
        tags: ['低卡', '快手', '高纤维']
    },
    {
        id: 5, name: '番茄炒蛋', category: '控糖', difficulty: '简单',
        cookingTime: 15, calories: 180, servings: 2,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1PW411T7YB&autoplay=0',
        ingredients: [
            { name: '番茄', amount: 300, unit: 'g' }, { name: '鸡蛋', amount: 3, unit: '个' },
            { name: '葱', amount: 10, unit: 'g' }, { name: '盐', amount: 3, unit: 'g' },
            { name: '糖', amount: 5, unit: 'g' }
        ],
        nutrition: { protein: 12, carbs: 8, fat: 10, fiber: 2 },
        steps: [
            { title: '准备食材', desc: '番茄洗净切块，鸡蛋打散，葱切末。' },
            { title: '炒鸡蛋', desc: '锅中加油，倒入蛋液炒至凝固盛出。' },
            { title: '炒番茄', desc: '锅中加油，放番茄翻炒出汁，加盐和糖调味。' },
            { title: '合炒', desc: '倒入鸡蛋翻炒均匀，撒葱花即可。' }
        ],
        tags: ['家常菜', '快手', '下饭']
    },
    {
        id: 6, name: '清蒸鲈鱼', category: '增肌', difficulty: '中等',
        cookingTime: 20, calories: 240, servings: 2,
        image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1QU4y1j7T4&autoplay=0',
        ingredients: [
            { name: '鲈鱼', amount: 500, unit: 'g' }, { name: '姜', amount: 20, unit: 'g' },
            { name: '葱', amount: 30, unit: 'g' }, { name: '蒸鱼豉油', amount: 30, unit: 'ml' },
            { name: '料酒', amount: 15, unit: 'ml' }
        ],
        nutrition: { protein: 38, carbs: 2, fat: 8, fiber: 0 },
        steps: [
            { title: '处理鱼', desc: '鲈鱼洗净划刀，抹料酒和姜片腌制10分钟。' },
            { title: '蒸鱼', desc: '水烧开后放入鲈鱼蒸8-10分钟。' },
            { title: '调味', desc: '倒掉汁水，淋蒸鱼豉油。' },
            { title: '浇热油', desc: '热油浇在葱丝上即可。' }
        ],
        tags: ['海鲜', '高蛋白', '低脂']
    },
    {
        id: 7, name: '希腊酸奶碗', category: '低卡', difficulty: '简单',
        cookingTime: 5, calories: 280, servings: 1,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV15gtKeBERk&autoplay=0',
        ingredients: [
            { name: '希腊酸奶', amount: 200, unit: 'g' }, { name: '蓝莓', amount: 50, unit: 'g' },
            { name: '草莓', amount: 50, unit: 'g' }, { name: '格兰诺拉', amount: 30, unit: 'g' },
            { name: '蜂蜜', amount: 10, unit: 'ml' }
        ],
        nutrition: { protein: 18, carbs: 32, fat: 6, fiber: 4 },
        steps: [
            { title: '准备酸奶', desc: '将希腊酸奶倒入碗中。' },
            { title: '添加配料', desc: '铺上蓝莓和草莓。' },
            { title: '完成', desc: '撒格兰诺拉和蜂蜜即可。' }
        ],
        tags: ['低卡', '快手', '高蛋白']
    },
    {
        id: 8, name: '糙米饭团', category: '控糖', difficulty: '简单',
        cookingTime: 30, calories: 320, servings: 2,
        image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1HK4y1S7jy&autoplay=0',
        ingredients: [
            { name: '糙米', amount: 200, unit: 'g' }, { name: '金枪鱼罐头', amount: 100, unit: 'g' },
            { name: '黄瓜', amount: 50, unit: 'g' }, { name: '胡萝卜', amount: 50, unit: 'g' },
            { name: '海苔', amount: 2, unit: '片' }
        ],
        nutrition: { protein: 22, carbs: 45, fat: 8, fiber: 6 },
        steps: [
            { title: '煮糙米', desc: '糙米洗净加水煮熟。' },
            { title: '准备馅料', desc: '黄瓜胡萝卜切丁，与金枪鱼混合。' },
            { title: '包饭团', desc: '取糙米包入馅料，捏成三角形。' },
            { title: '装饰', desc: '用海苔包裹底部即可。' }
        ],
        tags: ['控糖', '高纤维', '饱腹']
    },
    {
        id: 9, name: '蒜蓉西蓝花炒虾仁', category: '增肌', difficulty: '简单',
        cookingTime: 15, calories: 220, servings: 1,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1ed9qYBEwQ&autoplay=0',
        ingredients: [
            { name: '虾仁', amount: 200, unit: 'g' }, { name: '西蓝花', amount: 150, unit: 'g' },
            { name: '大蒜', amount: 10, unit: 'g' }, { name: '橄榄油', amount: 10, unit: 'ml' },
            { name: '盐', amount: 2, unit: 'g' }
        ],
        nutrition: { protein: 32, carbs: 8, fat: 6, fiber: 4 },
        steps: [
            { title: '准备食材', desc: '虾仁去壳，西蓝花切小朵，蒜切末。' },
            { title: '焯水', desc: '西蓝花焯水1分钟捞出。' },
            { title: '炒虾仁', desc: '热油爆蒜，放虾仁炒至变色。' },
            { title: '合炒', desc: '加西蓝花翻炒，调味出锅。' }
        ],
        tags: ['增肌', '高蛋白', '快手']
    },
    {
        id: 10, name: '紫薯燕麦粥', category: '养胃', difficulty: '简单',
        cookingTime: 25, calories: 210, servings: 1,
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV15gtKeBERk&autoplay=0',
        ingredients: [
            { name: '紫薯', amount: 150, unit: 'g' }, { name: '燕麦', amount: 50, unit: 'g' },
            { name: '牛奶', amount: 200, unit: 'ml' }, { name: '蜂蜜', amount: 10, unit: 'ml' }
        ],
        nutrition: { protein: 10, carbs: 38, fat: 4, fiber: 6 },
        steps: [
            { title: '准备食材', desc: '紫薯去皮切小块。' },
            { title: '煮粥', desc: '紫薯加水煮软，加入燕麦煮5分钟。' },
            { title: '调味', desc: '倒入牛奶搅匀，加蜂蜜即可。' }
        ],
        tags: ['养胃', '低脂', '高纤维']
    },
    {
        id: 11, name: '鸡胸肉藜麦碗', category: '减脂', difficulty: '简单',
        cookingTime: 30, calories: 380, servings: 1,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1PW411T7YB&autoplay=0',
        ingredients: [
            { name: '鸡胸肉', amount: 150, unit: 'g' }, { name: '藜麦', amount: 80, unit: 'g' },
            { name: '牛油果', amount: 0.5, unit: '个' }, { name: '小番茄', amount: 80, unit: 'g' },
            { name: '玉米粒', amount: 50, unit: 'g' }
        ],
        nutrition: { protein: 35, carbs: 30, fat: 14, fiber: 7 },
        steps: [
            { title: '煮藜麦', desc: '藜麦加水煮15分钟至透明。' },
            { title: '煎鸡胸', desc: '鸡胸肉调味后煎熟切片。' },
            { title: '准备配菜', desc: '牛油果切片，小番茄对半切。' },
            { title: '组装', desc: '碗中铺藜麦，摆上所有食材即可。' }
        ],
        tags: ['减脂', '高蛋白', '低卡']
    },
    {
        id: 12, name: '日式味噌汤', category: '养胃', difficulty: '简单',
        cookingTime: 15, calories: 80, servings: 2,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV15gtKeBERk&autoplay=0',
        ingredients: [
            { name: '味噌', amount: 30, unit: 'g' }, { name: '豆腐', amount: 100, unit: 'g' },
            { name: '海带', amount: 10, unit: 'g' }, { name: '葱', amount: 10, unit: 'g' }
        ],
        nutrition: { protein: 8, carbs: 6, fat: 3, fiber: 2 },
        steps: [
            { title: '准备食材', desc: '豆腐切小块，海带泡软，葱切花。' },
            { title: '煮汤', desc: '水烧开，放入海带煮3分钟。' },
            { title: '加味噌', desc: '用滤网将味噌溶入汤中搅匀。' },
            { title: '完成', desc: '加豆腐煮2分钟，撒葱花出锅。' }
        ],
        tags: ['养胃', '低卡', '清淡']
    },
    {
        id: 13, name: '牛油果鸡肉卷', category: '低卡', difficulty: '简单',
        cookingTime: 15, calories: 340, servings: 1,
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1BE411B7dK&autoplay=0',
        ingredients: [
            { name: '全麦饼皮', amount: 1, unit: '张' }, { name: '鸡胸肉', amount: 120, unit: 'g' },
            { name: '牛油果', amount: 0.5, unit: '个' }, { name: '生菜', amount: 30, unit: 'g' },
            { name: '番茄', amount: 50, unit: 'g' }
        ],
        nutrition: { protein: 28, carbs: 25, fat: 14, fiber: 6 },
        steps: [
            { title: '准备鸡肉', desc: '鸡胸肉煎熟切条。' },
            { title: '准备配料', desc: '牛油果切片，番茄切片。' },
            { title: '组装', desc: '饼皮铺生菜，放鸡肉、牛油果、番茄。' },
            { title: '卷起', desc: '卷紧切半即可。' }
        ],
        tags: ['低卡', '高蛋白', '快手']
    },
    {
        id: 14, name: '菠菜蘑菇意面', category: '控糖', difficulty: '中等',
        cookingTime: 20, calories: 360, servings: 1,
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1xGPwe7Eed&autoplay=0',
        ingredients: [
            { name: '全麦意面', amount: 80, unit: 'g' }, { name: '菠菜', amount: 100, unit: 'g' },
            { name: '蘑菇', amount: 80, unit: 'g' }, { name: '大蒜', amount: 5, unit: 'g' },
            { name: '橄榄油', amount: 10, unit: 'ml' }
        ],
        nutrition: { protein: 18, carbs: 48, fat: 10, fiber: 8 },
        steps: [
            { title: '煮意面', desc: '全麦意面按包装时间煮熟。' },
            { title: '炒配料', desc: '蘑菇切片，蒜切末，热油翻炒。' },
            { title: '加菠菜', desc: '菠菜加入炒软。' },
            { title: '拌面', desc: '意面捞出与配料拌匀，调味即可。' }
        ],
        tags: ['控糖', '高纤维', '素食友好']
    },
    {
        id: 15, name: '红豆薏米水', category: '养胃', difficulty: '简单',
        cookingTime: 50, calories: 90, servings: 2,
        image: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV15gtKeBERk&autoplay=0',
        ingredients: [
            { name: '红豆', amount: 50, unit: 'g' }, { name: '薏米', amount: 50, unit: 'g' },
            { name: '冰糖', amount: 15, unit: 'g' }
        ],
        nutrition: { protein: 4, carbs: 18, fat: 1, fiber: 3 },
        steps: [
            { title: '浸泡', desc: '红豆薏米提前浸泡2小时。' },
            { title: '煮水', desc: '加水大火煮开，转小火煮40分钟。' },
            { title: '调味', desc: '加冰糖搅溶即可。' }
        ],
        tags: ['养胃', '祛湿', '养生']
    },
    {
        id: 16, name: '香烤鸡腿配蔬菜', category: '增肌', difficulty: '中等',
        cookingTime: 40, calories: 450, servings: 1,
        image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1QU4y1j7T4&autoplay=0',
        ingredients: [
            { name: '鸡腿', amount: 200, unit: 'g' }, { name: '土豆', amount: 150, unit: 'g' },
            { name: '胡萝卜', amount: 100, unit: 'g' }, { name: '橄榄油', amount: 15, unit: 'ml' },
            { name: '迷迭香', amount: 2, unit: 'g' }
        ],
        nutrition: { protein: 32, carbs: 28, fat: 16, fiber: 4 },
        steps: [
            { title: '腌制', desc: '鸡腿用盐、黑胡椒、迷迭香腌制30分钟。' },
            { title: '准备蔬菜', desc: '土豆胡萝卜切块，拌橄榄油。' },
            { title: '烤制', desc: '烤箱200度，烤35分钟至金黄。' },
            { title: '出炉', desc: '取出静置5分钟后享用。' }
        ],
        tags: ['增肌', '高蛋白', '烤箱菜']
    },
    {
        id: 17, name: '低卡蔬菜汤', category: '减脂', difficulty: '简单',
        cookingTime: 20, calories: 85, servings: 2,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1ed9qYBEwQ&autoplay=0',
        ingredients: [
            { name: '西蓝花', amount: 100, unit: 'g' }, { name: '胡萝卜', amount: 80, unit: 'g' },
            { name: '芹菜', amount: 80, unit: 'g' }, { name: '洋葱', amount: 50, unit: 'g' },
            { name: '番茄', amount: 100, unit: 'g' }
        ],
        nutrition: { protein: 5, carbs: 12, fat: 1, fiber: 5 },
        steps: [
            { title: '切菜', desc: '所有蔬菜切小块。' },
            { title: '炒洋葱', desc: '少许油炒香洋葱。' },
            { title: '加水煮', desc: '加入所有蔬菜和水，煮15分钟。' },
            { title: '调味', desc: '加盐和黑胡椒调味即可。' }
        ],
        tags: ['减脂', '低卡', '高纤维']
    },
    {
        id: 18, name: '黑椒牛肉粒', category: '增肌', difficulty: '中等',
        cookingTime: 15, calories: 380, servings: 1,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1Da411Q7sY&autoplay=0',
        ingredients: [
            { name: '牛里脊', amount: 200, unit: 'g' }, { name: '青椒', amount: 100, unit: 'g' },
            { name: '洋葱', amount: 50, unit: 'g' }, { name: '黑胡椒', amount: 3, unit: 'g' },
            { name: '生抽', amount: 15, unit: 'ml' }
        ],
        nutrition: { protein: 38, carbs: 6, fat: 15, fiber: 2 },
        steps: [
            { title: '切肉', desc: '牛肉切粒，用生抽和黑胡椒腌15分钟。' },
            { title: '炒牛肉', desc: '大火快炒牛肉至变色盛出。' },
            { title: '炒蔬菜', desc: '青椒洋葱切块翻炒。' },
            { title: '合炒', desc: '倒回牛肉翻炒均匀即可。' }
        ],
        tags: ['增肌', '高蛋白', '快手']
    },
    {
        id: 19, name: '水果燕麦杯', category: '低卡', difficulty: '简单',
        cookingTime: 5, calories: 250, servings: 1,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV15gtKeBERk&autoplay=0',
        ingredients: [
            { name: '燕麦', amount: 40, unit: 'g' }, { name: '希腊酸奶', amount: 150, unit: 'g' },
            { name: '香蕉', amount: 0.5, unit: '根' }, { name: '蓝莓', amount: 30, unit: 'g' },
            { name: '蜂蜜', amount: 5, unit: 'ml' }
        ],
        nutrition: { protein: 15, carbs: 35, fat: 5, fiber: 5 },
        steps: [
            { title: '铺底层', desc: '杯底放燕麦。' },
            { title: '加酸奶', desc: '倒入希腊酸奶。' },
            { title: '加水果', desc: '放上香蕉片和蓝莓。' },
            { title: '完成', desc: '淋蜂蜜，冷藏后更佳。' }
        ],
        tags: ['低卡', '快手', '早餐']
    },
    {
        id: 20, name: '凉拌荞麦面', category: '控糖', difficulty: '简单',
        cookingTime: 15, calories: 300, servings: 1,
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
        video: 'https://player.bilibili.com/player.html?bvid=BV1ZC4y1b7c8&autoplay=0',
        ingredients: [
            { name: '荞麦面', amount: 100, unit: 'g' }, { name: '黄瓜', amount: 80, unit: 'g' },
            { name: '鸡蛋', amount: 1, unit: '个' }, { name: '日式酱油', amount: 15, unit: 'ml' },
            { name: '芥末', amount: 2, unit: 'g' }
        ],
        nutrition: { protein: 16, carbs: 42, fat: 6, fiber: 4 },
        steps: [
            { title: '煮面', desc: '荞麦面煮熟过冷水。' },
            { title: '准备配菜', desc: '黄瓜切丝，鸡蛋煮熟切片。' },
            { title: '调酱汁', desc: '日式酱油加芥末搅匀。' },
            { title: '拌面', desc: '面条沥干浇酱汁，摆配菜即可。' }
        ],
        tags: ['控糖', '低脂', '日式']
    }
];

// 食材数据库（扩充，去重）
const IngredientData = [
    { id: 1, name: '鸡胸肉', category: '肉类', calories: 133, protein: 31, carbs: 0, fat: 3, fiber: 0, unit: '100g', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200&h=200&fit=crop', benefits: ['高蛋白', '低脂肪', '增肌首选'], substitutes: ['火鸡胸肉', '瘦牛肉'] },
    { id: 2, name: '三文鱼', category: '海鲜', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, unit: '100g', image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=200&h=200&fit=crop', benefits: ['富含Omega-3', '抗炎', '心脏健康'], substitutes: ['鳕鱼', '鲈鱼'] },
    { id: 3, name: '西蓝花', category: '蔬菜', calories: 34, protein: 3, carbs: 7, fat: 0, fiber: 3, unit: '100g', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200&h=200&fit=crop', benefits: ['高纤维', '抗氧化', '维生素C'], substitutes: ['花椰菜', '羽衣甘蓝'] },
    { id: 4, name: '糙米', category: '谷物', calories: 116, protein: 3, carbs: 24, fat: 1, fiber: 2, unit: '100g', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop', benefits: ['高纤维', '低GI', '饱腹感强'], substitutes: ['藜麦', '燕麦'] },
    { id: 5, name: '牛油果', category: '水果', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, unit: '100g', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop', benefits: ['健康脂肪', '高纤维', '维生素E'], substitutes: ['橄榄油', '坚果酱'] },
    { id: 6, name: '鸡蛋', category: '蛋类', calories: 144, protein: 13, carbs: 1, fat: 10, fiber: 0, unit: '100g', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&h=200&fit=crop', benefits: ['优质蛋白', '维生素D', '胆碱'], substitutes: ['豆腐', '希腊酸奶'] },
    { id: 7, name: '燕麦', category: '谷物', calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11, unit: '100g', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=200&h=200&fit=crop', benefits: ['高纤维', '低GI', '饱腹感强'], substitutes: ['藜麦', '糙米'] },
    { id: 8, name: '番茄', category: '蔬菜', calories: 18, protein: 1, carbs: 4, fat: 0, fiber: 1, unit: '100g', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop', benefits: ['低卡', '番茄红素', '维生素C'], substitutes: ['红椒', '胡萝卜'] },
    { id: 9, name: '菠菜', category: '蔬菜', calories: 23, protein: 3, carbs: 4, fat: 0, fiber: 2, unit: '100g', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop', benefits: ['铁质丰富', '维生素K', '抗氧化'], substitutes: ['羽衣甘蓝', '生菜'] },
    { id: 10, name: '虾仁', category: '海鲜', calories: 99, protein: 20, carbs: 0, fat: 1, fiber: 0, unit: '100g', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop', benefits: ['高蛋白', '低脂', '富含硒'], substitutes: ['鱿鱼', '贝类'] },
    { id: 11, name: '牛肉', category: '肉类', calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0, unit: '100g', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop', benefits: ['高蛋白', '铁质丰富', '肌酸'], substitutes: ['瘦猪肉', '鸡腿肉'] },
    { id: 12, name: '豆腐', category: '豆制品', calories: 76, protein: 8, carbs: 2, fat: 4, fiber: 1, unit: '100g', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop', benefits: ['植物蛋白', '低卡', '钙质'], substitutes: ['豆干', '豆浆'] },
    { id: 13, name: '南瓜', category: '蔬菜', calories: 26, protein: 1, carbs: 6, fat: 0, fiber: 1, unit: '100g', image: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=200&h=200&fit=crop', benefits: ['低卡', '胡萝卜素', '养胃'], substitutes: ['红薯', '山药'] },
    { id: 14, name: '红薯', category: '谷物', calories: 86, protein: 2, carbs: 20, fat: 0, fiber: 3, unit: '100g', image: 'https://placehold.co/200x200/E8945B/fff?text=红薯', benefits: ['低GI', '高纤维', '饱腹'], substitutes: ['紫薯', '山药'] },
    { id: 15, name: '山药', category: '蔬菜', calories: 57, protein: 2, carbs: 13, fat: 0, fiber: 1, unit: '100g', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&h=200&fit=crop', benefits: ['养胃', '健脾', '低脂'], substitutes: ['南瓜', '红薯'] },
    { id: 16, name: '蓝莓', category: '水果', calories: 57, protein: 1, carbs: 14, fat: 0, fiber: 2, unit: '100g', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=200&h=200&fit=crop', benefits: ['抗氧化', '花青素', '护眼'], substitutes: ['草莓', '蔓越莓'] },
    { id: 17, name: '草莓', category: '水果', calories: 32, protein: 1, carbs: 8, fat: 0, fiber: 2, unit: '100g', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop', benefits: ['维生素C', '低卡', '抗氧化'], substitutes: ['蓝莓', '树莓'] },
    { id: 18, name: '希腊酸奶', category: '乳制品', calories: 97, protein: 10, carbs: 6, fat: 5, fiber: 0, unit: '100g', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop', benefits: ['高蛋白', '益生菌', '钙质'], substitutes: ['普通酸奶', '牛奶'] },
    { id: 19, name: '胡萝卜', category: '蔬菜', calories: 41, protein: 1, carbs: 10, fat: 0, fiber: 3, unit: '100g', image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=200&h=200&fit=crop', benefits: ['胡萝卜素', '护眼', '低卡'], substitutes: ['红薯', '南瓜'] },
    { id: 20, name: '藜麦', category: '谷物', calories: 120, protein: 4, carbs: 21, fat: 2, fiber: 3, unit: '100g', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop', benefits: ['完全蛋白', '低GI', '无麸质'], substitutes: ['糙米', '燕麦'] }
];

// 营养计算器食物数据库
const FoodDatabase = [
    { name: '米饭', calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3, unit: '100g' },
    { name: '糙米饭', calories: 116, protein: 2.6, carbs: 23.5, fat: 0.9, unit: '100g' },
    { name: '面条', calories: 110, protein: 3.5, carbs: 22, fat: 0.5, unit: '100g' },
    { name: '全麦面包', calories: 247, protein: 13, carbs: 41, fat: 3.5, unit: '100g' },
    { name: '鸡胸肉', calories: 133, protein: 31, carbs: 0, fat: 3, unit: '100g' },
    { name: '鸡腿', calories: 181, protein: 16, carbs: 0, fat: 13, unit: '100g' },
    { name: '三文鱼', calories: 208, protein: 20, carbs: 0, fat: 13, unit: '100g' },
    { name: '鲈鱼', calories: 105, protein: 18, carbs: 0, fat: 3, unit: '100g' },
    { name: '虾仁', calories: 99, protein: 20, carbs: 0, fat: 1, unit: '100g' },
    { name: '牛肉', calories: 250, protein: 26, carbs: 0, fat: 17, unit: '100g' },
    { name: '鸡蛋', calories: 144, protein: 13, carbs: 1, fat: 10, unit: '100g' },
    { name: '豆腐', calories: 76, protein: 8, carbs: 2, fat: 4, unit: '100g' },
    { name: '牛奶', calories: 66, protein: 3.3, carbs: 5, fat: 3.6, unit: '100ml' },
    { name: '酸奶', calories: 72, protein: 3.6, carbs: 9.3, fat: 2.7, unit: '100ml' },
    { name: '燕麦', calories: 389, protein: 17, carbs: 66, fat: 7, unit: '100g' },
    { name: '红薯', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: '100g' },
    { name: '土豆', calories: 76, protein: 2, carbs: 17, fat: 0.1, unit: '100g' },
    { name: '西蓝花', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, unit: '100g' },
    { name: '菠菜', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, unit: '100g' },
    { name: '番茄', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: '100g' },
    { name: '黄瓜', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, unit: '100g' },
    { name: '牛油果', calories: 160, protein: 2, carbs: 9, fat: 15, unit: '100g' },
    { name: '苹果', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: '100g' },
    { name: '香蕉', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: '100g' },
    { name: '蓝莓', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, unit: '100g' },
    { name: '草莓', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, unit: '100g' },
    { name: '橄榄油', calories: 884, protein: 0, carbs: 0, fat: 100, unit: '100ml' },
    { name: '花生酱', calories: 588, protein: 25, carbs: 20, fat: 50, unit: '100g' },
    { name: '蜂蜜', calories: 304, protein: 0.3, carbs: 82, fat: 0, unit: '100g' },
    { name: '坚果混合', calories: 607, protein: 20, carbs: 21, fat: 54, unit: '100g' }
];

// 营养数据
const NutritionData = {
    dailyIntake: { calories: 1280, protein: 85, carbs: 180, fat: 45 },
    weeklyTrend: [
        { day: '周一', calories: 1850, protein: 95, carbs: 220, fat: 65 },
        { day: '周二', calories: 1720, protein: 88, carbs: 200, fat: 60 },
        { day: '周三', calories: 1900, protein: 102, carbs: 230, fat: 70 },
        { day: '周四', calories: 1680, protein: 92, carbs: 190, fat: 55 },
        { day: '周五', calories: 1800, protein: 98, carbs: 210, fat: 62 },
        { day: '周六', calories: 0, protein: 0, carbs: 0, fat: 0 },
        { day: '周日', calories: 0, protein: 0, carbs: 0, fat: 0 }
    ],
    mealDistribution: { breakfast: 320, lunch: 580, dinner: 380 }
};

// 饮食小贴士
const HealthTips = [
    { id: 1, title: '蛋白质摄入建议', content: '每公斤体重建议摄入1.2-1.6克蛋白质，增肌人群可适当增加至2克。' },
    { id: 2, title: '饮水小提醒', content: '每天建议饮水2000-2500ml，运动后适当增加，有助于新陈代谢。' },
    { id: 3, title: '晚餐时间建议', content: '建议在睡前3-4小时完成晚餐，有助于消化和睡眠质量。' },
    { id: 4, title: '蔬菜摄入建议', content: '每天建议摄入300-500克蔬菜，其中深色蔬菜应占一半以上。' },
    { id: 5, title: '健康零食选择', content: '选择坚果、水果、酸奶作为零食，避免高糖高脂的加工食品。' },
    { id: 6, title: '碳水化合物', content: '选择复合碳水如糙米、燕麦，避免精制糖和白米白面。' },
    { id: 7, title: '烹饪方式', content: '优先选择蒸、煮、烤、凉拌，减少油炸和红烧。' },
    { id: 8, title: '早餐的重要性', content: '早餐应包含蛋白质和复合碳水，提供上午所需的能量。' },
    { id: 9, title: '膳食纤维', content: '每天摄入25-30克膳食纤维，有助于肠道健康和饱腹感。' },
    { id: 10, title: '健康脂肪', content: '选择不饱和脂肪酸，如橄榄油、坚果、鱼类，减少饱和脂肪。' }
];

// 7天饮食计划
const WeeklyPlan = {
    '周一': {
        breakfast: [
            { name: '燕麦牛奶', amount: '300ml+50g', calories: 220, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=100&h=100&fit=crop' },
            { name: '水煮蛋', amount: '2个', calories: 140, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=100&h=100&fit=crop' }
        ],
        lunch: [
            { name: '糙米饭', amount: '150g', calories: 180, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop' },
            { name: '清蒸鲈鱼', amount: '200g', calories: 240, image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=100&h=100&fit=crop' },
            { name: '清炒时蔬', amount: '150g', calories: 80, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop' }
        ],
        dinner: [
            { name: '鸡胸肉沙拉', amount: '250g', calories: 280, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop' },
            { name: '全麦面包', amount: '2片', calories: 120, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop' }
        ],
        totalCalories: 1260
    },
    '周二': {
        breakfast: [
            { name: '全麦三明治', amount: '1个', calories: 350, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=100&h=100&fit=crop' }
        ],
        lunch: [
            { name: '糙米饭', amount: '150g', calories: 180, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop' },
            { name: '番茄炒蛋', amount: '1份', calories: 180, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop' },
            { name: '凉拌黄瓜', amount: '100g', calories: 30, image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=100&h=100&fit=crop' }
        ],
        dinner: [
            { name: '蔬菜汤', amount: '300ml', calories: 80, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
            { name: '烤鸡胸', amount: '150g', calories: 200, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82571?w=100&h=100&fit=crop' }
        ],
        totalCalories: 1020
    },
    '周三': {
        breakfast: [
            { name: '希腊酸奶碗', amount: '1碗', calories: 280, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&h=100&fit=crop' }
        ],
        lunch: [
            { name: '糙米饭', amount: '150g', calories: 180, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop' },
            { name: '香煎三文鱼', amount: '200g', calories: 300, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=100&h=100&fit=crop' },
            { name: '蒜蓉西蓝花', amount: '150g', calories: 60, image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=100&h=100&fit=crop' }
        ],
        dinner: [
            { name: '鸡胸肉沙拉', amount: '250g', calories: 280, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop' }
        ],
        totalCalories: 1100
    },
    '周四': {
        breakfast: [
            { name: '燕麦粥', amount: '1碗', calories: 200, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=100&h=100&fit=crop' },
            { name: '水煮蛋', amount: '1个', calories: 70, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=100&h=100&fit=crop' }
        ],
        lunch: [
            { name: '糙米饭', amount: '150g', calories: 180, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop' },
            { name: '清炒虾仁', amount: '150g', calories: 150, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&h=100&fit=crop' },
            { name: '凉拌木耳', amount: '100g', calories: 40, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop' }
        ],
        dinner: [
            { name: '蔬菜沙拉', amount: '250g', calories: 120, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop' },
            { name: '烤鸡胸', amount: '150g', calories: 200, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82571?w=100&h=100&fit=crop' }
        ],
        totalCalories: 960
    },
    '周五': {
        breakfast: [
            { name: '全麦面包', amount: '2片', calories: 120, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop' },
            { name: '牛油果', amount: '半个', calories: 120, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100&h=100&fit=crop' }
        ],
        lunch: [
            { name: '糙米饭', amount: '150g', calories: 180, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop' },
            { name: '红烧豆腐', amount: '200g', calories: 150, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&h=100&fit=crop' },
            { name: '清炒菠菜', amount: '150g', calories: 40, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=100&h=100&fit=crop' }
        ],
        dinner: [
            { name: '三文鱼沙拉', amount: '250g', calories: 300, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=100&h=100&fit=crop' }
        ],
        totalCalories: 910
    },
    '周六': {
        breakfast: [
            { name: '煎蛋', amount: '2个', calories: 180, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=100&h=100&fit=crop' },
            { name: '全麦吐司', amount: '1片', calories: 80, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop' }
        ],
        lunch: [
            { name: '糙米饭', amount: '150g', calories: 180, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop' },
            { name: '烤鸡腿', amount: '1个', calories: 250, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=100&h=100&fit=crop' },
            { name: '炒青菜', amount: '150g', calories: 50, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop' }
        ],
        dinner: [
            { name: '蔬菜汤', amount: '300ml', calories: 80, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
            { name: '蒸鱼', amount: '150g', calories: 180, image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=100&h=100&fit=crop' }
        ],
        totalCalories: 1000
    },
    '周日': {
        breakfast: [
            { name: '燕麦牛奶', amount: '300ml+50g', calories: 220, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=100&h=100&fit=crop' }
        ],
        lunch: [
            { name: '糙米饭', amount: '150g', calories: 180, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop' },
            { name: '番茄牛腩', amount: '200g', calories: 300, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop' },
            { name: '炒豆芽', amount: '150g', calories: 40, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop' }
        ],
        dinner: [
            { name: '鸡胸肉沙拉', amount: '250g', calories: 280, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop' }
        ],
        totalCalories: 1020
    }
};

// 食材搭配禁忌
const FoodTaboos = [
    { food1: '菠菜', food2: '豆腐', reason: '草酸影响钙吸收' },
    { food1: '虾', food2: '维生素C', reason: '可能产生有害物质' },
    { food1: '牛奶', food2: '巧克力', reason: '影响钙吸收' },
    { food1: '蜂蜜', food2: '洋葱', reason: '可能引起消化不适' },
    { food1: '红薯', food2: '柿子', reason: '可能形成胃结石' }
];