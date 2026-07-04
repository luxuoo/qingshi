/**
 * 轻食悦膳 - 主应用逻辑（完整版）
 */

// ========== 应用状态 ==========
const AppState = {
    currentPage: 'home',
    isDarkMode: false,
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    browsingHistory: JSON.parse(localStorage.getItem('browsingHistory') || '[]'),
    nutritionGoal: JSON.parse(localStorage.getItem('nutritionGoal') || '{"calories":2000,"protein":120,"carbs":250,"fat":65}'),
    bodyData: JSON.parse(localStorage.getItem('bodyData') || '{"height":175,"weight":72,"targetWeight":68}'),
    dailyCheckin: JSON.parse(localStorage.getItem('dailyCheckin') || '{"breakfast":[],"lunch":[],"dinner":[]}'),
    calculatorFoods: [],
    currentRecipeFilter: '全部',
    currentMealFilter: '',
    currentIngredientCategory: '全部',
    currentDay: '周一',
    tipIndex: 0,
    currentUser: null,
    currentPostFilter: 'all',
    posts: JSON.parse(localStorage.getItem('posts') || '[]')
};

// ========== API 请求工具 ==========
const API_BASE = '/api';

async function apiRequest(path, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '请求失败');
    return data;
}

// ========== 用户认证系统 ==========
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

async function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showToast('请输入用户名和密码');
        return;
    }

    try {
        const data = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        AppState.currentUser = data.user;
        document.getElementById('auth-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('auth-screen').style.display = 'none';
            showToast('登录成功，欢迎回来！');
        }, 300);
    } catch (err) {
        showToast(err.message || '用户名或密码错误');
    }
}

async function handleRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!username || !phone || !password || !confirm) {
        showToast('请填写所有字段');
        return;
    }

    if (username.length < 2) {
        showToast('用户名至少2个字符');
        return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
        showToast('请输入有效的手机号');
        return;
    }

    if (password.length < 6) {
        showToast('密码至少6位');
        return;
    }

    if (password !== confirm) {
        showToast('两次密码不一致');
        return;
    }

    try {
        const data = await apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify({ username, phone, password })
        });
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        AppState.currentUser = data.user;

        document.getElementById('auth-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('auth-screen').style.display = 'none';
            showToast('注册成功，欢迎使用！');
        }, 300);
    } catch (err) {
        showToast(err.message || '注册失败');
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    AppState.currentUser = null;
    location.reload();
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    const user = getCurrentUser();
    if (token && user) {
        try {
            const profile = await apiRequest('/user/profile');
            AppState.currentUser = profile;
            setCurrentUser(profile);
            document.getElementById('auth-screen').style.display = 'none';
        } catch {
            // token过期，清除
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            document.getElementById('auth-screen').style.opacity = '1';
        }
    } else {
        document.getElementById('auth-screen').style.opacity = '1';
    }
}

// ========== DOM缓存 ==========
const DOM = {};
function cacheDOM() {
    DOM.loadingScreen = document.getElementById('loading-screen');
    DOM.mainContent = document.getElementById('main-content');
    DOM.mobileNav = document.getElementById('mobile-nav');
    DOM.desktopSidebar = document.getElementById('desktop-sidebar');
    DOM.themeToggleMobile = document.getElementById('theme-toggle-mobile');
    DOM.themeToggleDesktop = document.getElementById('theme-toggle-desktop');
    DOM.themeToggleProfile = document.getElementById('theme-toggle-profile');
    DOM.searchToggle = document.getElementById('search-toggle');
    DOM.searchModal = document.getElementById('search-modal');
    DOM.searchModalContent = document.getElementById('search-modal-content');
    DOM.globalSearch = document.getElementById('global-search');
    DOM.recipeModal = document.getElementById('recipe-modal');
    DOM.modalContent = document.getElementById('modal-content');
    DOM.pages = {};
    document.querySelectorAll('.page').forEach(p => { DOM.pages[p.id.replace('page-', '')] = p; });
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    cacheDOM();
    checkAuth();
    bindEvents();
    applyTheme();
    renderAll();
    initChartsSafe();
    hideLoading();
});

function hideLoading() {
    setTimeout(() => {
        if (DOM.loadingScreen) {
            DOM.loadingScreen.style.opacity = '0';
            setTimeout(() => { DOM.loadingScreen.style.display = 'none'; }, 500);
        }
    }, 1200);
}

// ========== 事件绑定 ==========
function bindEvents() {
    // 页面导航
    document.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', e => { e.preventDefault(); navigateTo(btn.getAttribute('data-page')); });
    });

    // 主题切换
    [DOM.themeToggleMobile, DOM.themeToggleDesktop, DOM.themeToggleProfile].forEach(el => {
        if (el) el.addEventListener('click', toggleTheme);
    });

    // 搜索
    if (DOM.searchToggle) DOM.searchToggle.addEventListener('click', openSearch);
    if (DOM.globalSearch) DOM.globalSearch.addEventListener('input', handleGlobalSearch);

    // 模态框关闭
    document.getElementById('modal-overlay')?.addEventListener('click', closeRecipeModal);
    DOM.closeModal?.addEventListener('click', closeRecipeModal);
    document.getElementById('search-modal-overlay')?.addEventListener('click', closeSearch);
    document.getElementById('close-search')?.addEventListener('click', closeSearch);

    // 食谱筛选
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', e => {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            AppState.currentRecipeFilter = e.target.textContent.trim();
            renderRecipeList();
        });
    });

    // 餐食筛选
    document.querySelectorAll('.filter-meal').forEach(tag => {
        tag.addEventListener('click', e => {
            const meal = e.target.textContent.replace(/[🌅☀️🌙\s]/g, '').trim();
            if (AppState.currentMealFilter === meal) {
                AppState.currentMealFilter = '';
                e.target.classList.remove('bg-orange-100', 'dark:bg-orange-900/30', 'text-orange-600', 'dark:text-orange-400', 'bg-yellow-100', 'dark:bg-yellow-900/30', 'text-yellow-600', 'dark:text-yellow-400', 'bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400');
                e.target.classList.add('bg-white', 'dark:bg-gray-800');
            } else {
                document.querySelectorAll('.filter-meal').forEach(t => {
                    t.classList.remove('bg-orange-100', 'dark:bg-orange-900/30', 'text-orange-600', 'dark:text-orange-400', 'bg-yellow-100', 'dark:bg-yellow-900/30', 'text-yellow-600', 'dark:text-yellow-400', 'bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400');
                    t.classList.add('bg-white', 'dark:bg-gray-800');
                });
                AppState.currentMealFilter = meal;
                const colorMap = { '早餐': ['bg-orange-100', 'dark:bg-orange-900/30', 'text-orange-600', 'dark:text-orange-400'], '午餐': ['bg-yellow-100', 'dark:bg-yellow-900/30', 'text-yellow-600', 'dark:text-yellow-400'], '晚餐': ['bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400'] };
                e.target.classList.remove('bg-white', 'dark:bg-gray-800');
                (colorMap[meal] || []).forEach(c => e.target.classList.add(c));
            }
            renderRecipeList();
        });
    });

    // 食材分类
    document.querySelectorAll('.ingredient-category').forEach(cat => {
        cat.addEventListener('click', e => {
            document.querySelectorAll('.ingredient-category').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            AppState.currentIngredientCategory = e.target.textContent.trim();
            renderIngredientList();
        });
    });

    // 渲染日期标签
    renderDayTabs();

    // 搜索输入
    document.getElementById('recipe-search')?.addEventListener('input', e => renderRecipeList(e.target.value));
    document.getElementById('ingredient-search')?.addEventListener('input', e => renderIngredientList(e.target.value));
    document.getElementById('food-search')?.addEventListener('input', handleFoodSearch);

    // 快捷食物添加
    document.querySelectorAll('.food-quick-add').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.querySelector('.font-medium').textContent;
            addFoodToCalculator(name);
        });
    });

    // 键盘快捷键
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeSearch(); closeRecipeModal(); closeBodyDataModal(); closeGoalModal(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    });

    // 窗口调整
    window.addEventListener('resize', handleResize);
    handleResize();
}

// ========== 页面导航 ==========
function navigateTo(page) {
    Object.values(DOM.pages).forEach(p => { p.classList.add('hidden'); p.classList.remove('active'); });
    if (DOM.pages[page]) {
        DOM.pages[page].classList.remove('hidden');
        DOM.pages[page].classList.add('active');
        DOM.pages[page].style.animation = 'none';
        DOM.pages[page].offsetHeight;
        DOM.pages[page].style.animation = 'fadeIn 0.3s ease-out';
    }
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(i => {
        i.classList.toggle('active', i.getAttribute('data-page') === page);
    });
    document.querySelectorAll('.mobile-nav-item').forEach(i => {
        const isActive = i.getAttribute('data-page') === page;
        i.classList.toggle('active', isActive);
        i.classList.toggle('text-gray-400', !isActive);
        i.classList.toggle('dark:text-gray-500', !isActive);
        i.classList.toggle('text-primary-500', isActive);
    });
    AppState.currentPage = page;
    localStorage.setItem('currentPage', page);
    if (page === 'home') setTimeout(initChartsSafe, 100);
    if (page === 'profile') renderProfile();
    if (page === 'plan') renderDailyPlan();
    if (page === 'community') renderPostList();
    window.scrollTo(0, 0);
}

function handleResize() {
    const w = window.innerWidth;
    if (w < 768) {
        DOM.desktopSidebar?.classList.add('hidden');
        DOM.mobileNav?.classList.remove('hidden');
    } else {
        DOM.desktopSidebar?.classList.remove('hidden');
        DOM.mobileNav?.classList.add('hidden');
    }
}

// ========== 主题切换 ==========
function toggleTheme() {
    AppState.isDarkMode = !AppState.isDarkMode;
    localStorage.setItem('theme', AppState.isDarkMode ? 'dark' : 'light');
    applyTheme();
}

function applyTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) AppState.isDarkMode = saved === 'dark';
    else AppState.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', AppState.isDarkMode);
    // 更新切换按钮状态
    const dot = DOM.themeToggleProfile?.querySelector('div');
    if (dot) dot.classList.toggle('translate-x-6', AppState.isDarkMode);
    if (typeof updateChartsTheme === 'function') updateChartsTheme(AppState.isDarkMode);
}

// ========== 搜索功能 ==========
function openSearch() {
    DOM.searchModal?.classList.remove('hidden');
    setTimeout(() => {
        DOM.searchModalContent?.classList.add('show');
        DOM.globalSearch?.focus();
    }, 10);
}

function closeSearch() {
    DOM.searchModalContent?.classList.remove('show');
    setTimeout(() => {
        DOM.searchModal?.classList.add('hidden');
        if (DOM.globalSearch) DOM.globalSearch.value = '';
        document.getElementById('search-results') && (document.getElementById('search-results').innerHTML = '');
    }, 300);
}

function handleGlobalSearch(e) {
    const q = e.target.value.toLowerCase().trim();
    const container = document.getElementById('search-results');
    if (!container) return;
    if (q.length < 1) { container.innerHTML = ''; return; }
    const matchedRecipes = RecipeData.filter(r => r.name.includes(q) || r.tags.some(t => t.includes(q)) || r.category.includes(q));
    const matchedIngredients = IngredientData.filter(i => i.name.includes(q) || i.category.includes(q));
    const matchedFoods = FoodDatabase.filter(f => f.name.includes(q));
    let html = '';
    if (matchedRecipes.length) {
        html += '<div class="mb-4"><h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">食谱</h4>';
        matchedRecipes.slice(0, 5).forEach(r => {
            html += `<button class="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left" onclick="closeSearch();navigateTo('recipes');openRecipeModal(${r.id})">
                <img src="${r.image}" class="w-10 h-10 rounded-lg object-cover mr-3 flex-shrink-0" alt="">
                <div><div class="font-medium text-gray-800 dark:text-white text-sm">${r.name}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${r.category} · ${r.calories}千卡</div></div></button>`;
        });
        html += '</div>';
    }
    if (matchedIngredients.length) {
        html += '<div class="mb-4"><h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">食材</h4>';
        matchedIngredients.slice(0, 5).forEach(i => {
            html += `<button class="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left" onclick="closeSearch();navigateTo('ingredients')">
                <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 flex-shrink-0 text-lg">${i.name.charAt(0)}</div>
                <div><div class="font-medium text-gray-800 dark:text-white text-sm">${i.name}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${i.category} · ${i.calories}千卡/100g</div></div></button>`;
        });
        html += '</div>';
    }
    if (matchedFoods.length) {
        html += '<div><h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">食物热量</h4>';
        matchedFoods.slice(0, 5).forEach(f => {
            html += `<button class="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left" onclick="closeSearch();navigateTo('calculator');addFoodToCalculator('${f.name}')">
                <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <span class="text-primary-600 dark:text-primary-400 text-xs font-bold">${f.calories}</span>
                </div>
                <div><div class="font-medium text-gray-800 dark:text-white text-sm">${f.name}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${f.calories}千卡/${f.unit}</div></div></button>`;
        });
        html += '</div>';
    }
    if (!html) html = '<div class="text-center py-8 text-gray-400 dark:text-gray-500">未找到相关内容</div>';
    container.innerHTML = html;
}

// ========== 食谱模态框 ==========
function openRecipeModal(id) {
    const recipe = RecipeData.find(r => r.id === id);
    if (!recipe) return;
    addToHistory(id);
    const modal = DOM.modalContent;
    if (!modal) return;
    const isFav = AppState.favorites.includes(id);
    modal.innerHTML = buildRecipeModalHTML(recipe, isFav);
    DOM.recipeModal?.classList.remove('hidden');
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeRecipeModal() {
    DOM.modalContent?.classList.remove('show');
    setTimeout(() => DOM.recipeModal?.classList.add('hidden'), 300);
}

function buildRecipeModalHTML(r, isFav) {
    return `<div class="h-full overflow-y-auto">
        <div class="relative h-56 md:h-72">
            <img src="${r.image}" class="w-full h-full object-cover" alt="${r.name}">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <button onclick="closeRecipeModal()" class="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <svg class="w-5 h-5 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div class="absolute bottom-4 left-4 right-4">
                <div class="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span class="px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">${r.category}</span>
                    <span class="px-3 py-1 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-xs font-medium rounded-full backdrop-blur-sm">${r.difficulty}</span>
                    ${renderMealTags(getMealTypes(r.name))}
                </div>
                <h2 class="text-2xl font-bold text-white">${r.name}</h2>
            </div>
        </div>
        <div class="p-5">
            <div class="grid grid-cols-3 gap-3 mb-5">
                <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div class="text-lg font-bold text-gray-800 dark:text-white">${r.cookingTime}分钟</div><div class="text-xs text-gray-500 dark:text-gray-400">烹饪时长</div></div>
                <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div class="text-lg font-bold text-gray-800 dark:text-white">${r.calories}千卡</div><div class="text-xs text-gray-500 dark:text-gray-400">热量</div></div>
                <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div class="text-lg font-bold text-gray-800 dark:text-white">${r.servings}人份</div><div class="text-xs text-gray-500 dark:text-gray-400">份量</div></div>
            </div>
            <div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">营养成分（每份）</h3>
                <div class="grid grid-cols-4 gap-2">
                    <div class="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><div class="text-sm font-bold text-blue-600 dark:text-blue-400">${r.nutrition.protein}g</div><div class="text-xs text-gray-500">蛋白质</div></div>
                    <div class="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"><div class="text-sm font-bold text-yellow-600 dark:text-yellow-400">${r.nutrition.carbs}g</div><div class="text-xs text-gray-500">碳水</div></div>
                    <div class="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"><div class="text-sm font-bold text-green-600 dark:text-green-400">${r.nutrition.fat}g</div><div class="text-xs text-gray-500">脂肪</div></div>
                    <div class="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><div class="text-sm font-bold text-purple-600 dark:text-purple-400">${r.nutrition.fiber}g</div><div class="text-xs text-gray-500">纤维</div></div>
                </div>
            </div>
            <div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">食材清单</h3>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div class="grid grid-cols-2 gap-2">
                        ${r.ingredients.map(i => `<div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">${i.name}</span><span class="font-medium text-gray-800 dark:text-white">${i.amount}${i.unit}</span></div>`).join('')}
                    </div>
                </div>
            </div>
            <div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">烹饪步骤</h3>
                <div class="space-y-4">
                    ${r.steps.map((s, idx) => `<div class="flex">
                        <div class="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">${idx + 1}</div>
                        <div><h4 class="font-medium text-gray-800 dark:text-white mb-1">${s.title}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${s.desc}</p></div></div>`).join('')}
                </div>
            </div>
            ${r.video ? `
            <div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">制作视频</h3>
                <div class="relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
                    <iframe src="${r.video}" class="absolute inset-0 w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
            ` : ''}
            <div class="flex space-x-3">
                <button onclick="toggleFavorite(${r.id});openRecipeModal(${r.id})" class="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium transition-colors flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2 ${isFav ? 'text-red-500 fill-current' : ''}" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    ${isFav ? '已收藏' : '收藏'}
                </button>
                <button onclick="shareRecipe(${r.id})" class="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium transition-colors flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    分享
                </button>
                <button onclick="addToPlan(${r.id})" class="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    加入计划
                </button>
            </div>
        </div></div>`;
}

// ========== 收藏功能 ==========
function toggleFavorite(id) {
    const idx = AppState.favorites.indexOf(id);
    if (idx === -1) { AppState.favorites.push(id); showToast('已添加到收藏'); }
    else { AppState.favorites.splice(idx, 1); showToast('已取消收藏'); }
    localStorage.setItem('favorites', JSON.stringify(AppState.favorites));
    renderRecipeList();
}

// ========== 浏览历史 ==========
function addToHistory(id) {
    AppState.browsingHistory = AppState.browsingHistory.filter(h => h.id !== id);
    AppState.browsingHistory.unshift({ id, time: Date.now() });
    if (AppState.browsingHistory.length > 20) AppState.browsingHistory.pop();
    localStorage.setItem('browsingHistory', JSON.stringify(AppState.browsingHistory));
}

// ========== 分享功能 ==========
function shareRecipe(id) {
    const recipe = RecipeData.find(r => r.id === id);
    if (!recipe) return;
    const text = `轻食悦膳推荐：${recipe.name} - ${recipe.calories}千卡，烹饪${recipe.cookingTime}分钟`;
    if (navigator.share) {
        navigator.share({ title: recipe.name, text: text }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('食谱信息已复制到剪贴板'));
    } else {
        showToast('分享链接已生成');
    }
}

// ========== 加入饮食计划 ==========
function addToPlan(id) {
    const recipe = RecipeData.find(r => r.id === id);
    if (!recipe) return;
    const plan = WeeklyPlan[AppState.currentDay];
    if (!plan) return;
    
    // 根据食谱名称判断是早餐、午餐还是晚餐
    const mealTypes = getMealTypes(recipe.name);
    let targetMeal = 'lunch'; // 默认午餐
    if (mealTypes.includes('早餐')) targetMeal = 'breakfast';
    else if (mealTypes.includes('晚餐')) targetMeal = 'dinner';
    
    // 添加到对应餐食
    plan[targetMeal].push({
        name: recipe.name,
        calories: recipe.calories,
        amount: '1份',
        image: recipe.image
    });
    
    renderDailyPlan();
    showToast(`已将"${recipe.name}"加入${AppState.currentDay}的${targetMeal === 'breakfast' ? '早餐' : targetMeal === 'dinner' ? '晚餐' : '午餐'}`);
}

// ========== 食谱渲染与筛选 ==========
function renderRecipeList(searchQuery) {
    const grid = document.getElementById('recipe-grid');
    if (!grid) return;
    let recipes = [...RecipeData];
    const filter = AppState.currentRecipeFilter;
    const mealFilter = AppState.currentMealFilter;
    if (filter !== '全部') recipes = recipes.filter(r => r.category === filter || r.tags.some(t => t.includes(filter)));
    if (mealFilter) recipes = recipes.filter(r => getMealTypes(r.name).includes(mealFilter));
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        recipes = recipes.filter(r => r.name.includes(q) || r.tags.some(t => t.includes(q)) || r.category.includes(q));
    }
    if (!recipes.length) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400 dark:text-gray-500"><svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg><p>未找到匹配的食谱</p></div>';
        return;
    }
    grid.innerHTML = recipes.map(r => {
        const isFav = AppState.favorites.includes(r.id);
        return `<div class="recipe-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer" onclick="openRecipeModal(${r.id})">
            <div class="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <img src="${r.image}" alt="${r.name}" class="w-full h-full object-cover" loading="lazy">
                <div class="absolute top-3 left-3 flex items-center gap-1 flex-wrap">
                    <span class="px-2 py-0.5 bg-white/90 dark:bg-gray-800/90 rounded-full text-xs font-medium text-primary-600 dark:text-primary-400 backdrop-blur-sm">${r.category}</span>
                    ${renderMealTags(getMealTypes(r.name))}
                </div>
                <button onclick="event.stopPropagation();toggleFavorite(${r.id})" class="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors">
                    <svg class="w-4 h-4 ${isFav ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-300'}" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </button>
            </div>
            <div class="p-4">
                <h4 class="font-bold text-gray-800 dark:text-white mb-2">${r.name}</h4>
                <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span class="flex items-center mr-3"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>${r.cookingTime}分钟</span>
                    <span class="flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>${r.calories}千卡</span>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-1">
                        <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">${r.difficulty}</span>
                        <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">${r.servings}人份</span>
                        ${r.video ? '<svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' : ''}
                    </div>
                    <span class="text-sm font-medium text-primary-600 dark:text-primary-400">查看详情 →</span>
                </div>
            </div></div>`;
    }).join('');
}

// ========== 食材渲染与筛选 ==========
function renderIngredientList(searchQuery) {
    const list = document.getElementById('ingredient-list');
    if (!list) return;
    let items = [...IngredientData];
    const cat = AppState.currentIngredientCategory;
    if (cat !== '全部') items = items.filter(i => i.category === cat);
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        items = items.filter(i => i.name.includes(q) || i.category.includes(q));
    }
    if (!items.length) {
        list.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">未找到匹配的食材</div>';
        return;
    }
    list.innerHTML = items.map(i => `<div onclick="openIngredientDetail(${i.id})" class="ingredient-card bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer">
        <div class="flex items-start">
            <img src="${i.image}" alt="${i.name}" class="w-16 h-16 rounded-xl object-cover mr-4 flex-shrink-0" loading="lazy">
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                    <h4 class="font-bold text-gray-800 dark:text-white">${i.name}</h4>
                    <span class="text-xs text-gray-400 dark:text-gray-500">${i.unit}</span>
                </div>
                <div class="flex items-center gap-1 mb-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">${i.category}</span>
                    ${renderMealTags(getMealTypes(i.name))}
                </div>
                <div class="grid grid-cols-2 gap-1 text-xs">
                    <div class="flex justify-between"><span class="text-gray-500">热量</span><span class="font-medium text-gray-800 dark:text-white">${i.calories}千卡</span></div>
                    <div class="flex justify-between"><span class="text-gray-500">蛋白质</span><span class="font-medium text-gray-800 dark:text-white">${i.protein}g</span></div>
                    <div class="flex justify-between"><span class="text-gray-500">碳水</span><span class="font-medium text-gray-800 dark:text-white">${i.carbs}g</span></div>
                    <div class="flex justify-between"><span class="text-gray-500">脂肪</span><span class="font-medium text-gray-800 dark:text-white">${i.fat}g</span></div>
                </div>
            </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div class="flex flex-wrap gap-1 mb-2">
                ${i.benefits.map(b => `<span class="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded text-xs">${b}</span>`).join('')}
            </div>
            ${i.substitutes.length ? `<div class="text-xs text-gray-500 dark:text-gray-400">替代食材: <span class="text-primary-600 dark:text-primary-400">${i.substitutes.join('、')}</span></div>` : ''}
        </div></div>`).join('');
}

// ========== 日期标签渲染 ==========
function renderDayTabs() {
    const container = document.getElementById('day-tabs');
    if (!container) return;
    
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    container.innerHTML = days.map(day => {
        const isActive = day === AppState.currentDay;
        return `<button class="day-tab flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 border border-gray-200 dark:border-gray-700'}" onclick="selectDay('${day}')">${day}</button>`;
    }).join('');
}

function selectDay(day) {
    AppState.currentDay = day;
    renderDayTabs();
    renderDailyPlan();
}

// ========== 饮食计划渲染 ==========
function renderDailyPlan() {
    const day = AppState.currentDay;
    const plan = WeeklyPlan[day];
    if (!plan) return;
    const meals = [
        { key: 'breakfast', label: '早餐', icon: '🌅', color: 'orange' },
        { key: 'lunch', label: '午餐', icon: '☀️', color: 'yellow' },
        { key: 'dinner', label: '晚餐', icon: '🌙', color: 'purple' }
    ];
    const container = document.getElementById('plan-meals');
    if (container) {
        container.innerHTML = meals.map(m => {
            const items = plan[m.key] || [];
            const total = items.reduce((s, i) => s + i.calories, 0);
            return `<div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-card">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-xl bg-${m.color}-100 dark:bg-${m.color}-900/30 flex items-center justify-center mr-3"><span class="text-lg">${m.icon}</span></div>
                        <h3 class="font-bold text-gray-800 dark:text-white">${m.label}</h3>
                    </div>
                    <button onclick="showAddFoodModal('${m.key}')" class="text-primary-500 hover:text-primary-600 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg></button>
                </div>
                <div class="space-y-3">
                    ${items.map((item, idx) => `<div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors" onclick="openFoodDetail('${item.name}')">
                        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover mr-3 flex-shrink-0" onerror="this.style.display='none'">
                        <div class="flex-1 min-w-0"><div class="font-medium text-gray-800 dark:text-white text-sm">${item.name}</div><div class="text-xs text-gray-500 dark:text-gray-400">${item.amount}</div></div>
                        <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">${item.calories}千卡</div>
                        <button onclick="event.stopPropagation();removePlanItem('${m.key}',${idx})" class="text-gray-400 hover:text-red-500 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                    </div>`).join('')}
                    ${!items.length ? '<div class="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">暂无食物，点击+添加</div>' : ''}
                </div>
                <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div class="flex justify-between text-sm"><span class="text-gray-500 dark:text-gray-400">${m.label}合计</span><span class="font-bold text-gray-800 dark:text-white">${total}千卡</span></div>
                </div></div>`;
        }).join('');
    }
    // 动态计算总热量
    const totalCal = (plan.breakfast.reduce((s, i) => s + i.calories, 0) +
                     plan.lunch.reduce((s, i) => s + i.calories, 0) +
                     plan.dinner.reduce((s, i) => s + i.calories, 0));
    // 更新总结
    const summary = document.getElementById('plan-summary');
    if (summary) {
        const pct = Math.round((totalCal / AppState.nutritionGoal.calories) * 100);
        const dayCheckin = AppState.weeklyCheckin[AppState.currentDay];
        const isChecked = dayCheckin && dayCheckin.checked;
        summary.innerHTML = `
            <h3 class="font-bold text-gray-800 dark:text-white mb-4">今日饮食总结</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><div class="text-2xl font-bold text-gray-800 dark:text-white mb-1">${totalCal.toLocaleString()}</div><div class="text-sm text-gray-500 dark:text-gray-400">总热量(千卡)</div></div>
                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><div class="text-2xl font-bold text-gray-800 dark:text-white mb-1">${pct}%</div><div class="text-sm text-gray-500 dark:text-gray-400">目标完成度</div></div>
                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><div class="text-2xl font-bold text-gray-800 dark:text-white mb-1">${(plan.breakfast.length + plan.lunch.length + plan.dinner.length)}</div><div class="text-sm text-gray-500 dark:text-gray-400">食物种类</div></div>
                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><div class="text-2xl font-bold text-gray-800 dark:text-white mb-1">3餐</div><div class="text-sm text-gray-500 dark:text-gray-400">已记录餐数</div></div>
            </div>
            <div class="flex items-center justify-between mb-2"><span class="text-sm text-gray-500 dark:text-gray-400">热量进度</span><span class="text-sm font-medium text-gray-800 dark:text-white">${totalCal} / ${AppState.nutritionGoal.calories} 千卡</span></div>
            <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4"><div class="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500" style="width:${Math.min(pct, 100)}%"></div></div>
            <div class="flex space-x-3">
                ${isChecked
                    ? `<button onclick="undoCheckin()" class="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        取消今日打卡
                    </button>`
                    : `<button onclick="doCheckin()" class="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        今日打卡
                    </button>`
                }
            </div>`;
    }
}

function removePlanItem(mealKey, idx) {
    const plan = WeeklyPlan[AppState.currentDay];
    if (plan && plan[mealKey]) {
        plan[mealKey].splice(idx, 1);
        renderDailyPlan();
        showToast('已移除食物');
    }
}

// 当前添加食物的目标餐食
let currentAddMealKey = '';

function showAddFoodModal(mealKey) {
    currentAddMealKey = mealKey;
    const mealNames = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };
    const overlay = document.createElement('div');
    overlay.id = 'addfood-modal-overlay';
    overlay.className = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4';
    overlay.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">添加食物到${mealNames[mealKey]}</h3>
        <div class="relative mb-4">
            <input type="text" id="plan-food-search" placeholder="搜索食物..." class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200">
            <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <div id="plan-food-results" class="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 max-h-60 overflow-y-auto hidden"></div>
        </div>
        <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">常用食物</h4>
            <div class="grid grid-cols-2 gap-2" id="quick-food-list"></div>
        </div>
        <div class="flex space-x-3 mt-4">
            <button onclick="closeAddFoodModal()" class="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-medium transition-colors">取消</button>
        </div>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAddFoodModal(); });

    // 渲染常用食物
    const quickList = document.getElementById('quick-food-list');
    const commonFoods = FoodDatabase.slice(0, 8);
    if (quickList) {
        quickList.innerHTML = commonFoods.map(f => `
            <button onclick="addFoodToPlan('${f.name}')" class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                <div class="font-medium text-gray-800 dark:text-white text-sm">${f.name}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${f.calories}千卡/${f.unit}</div>
            </button>
        `).join('');
    }

    // 搜索功能
    document.getElementById('plan-food-search')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase().trim();
        const results = document.getElementById('plan-food-results');
        if (!results) return;
        if (q.length < 1) { results.innerHTML = ''; results.classList.add('hidden'); return; }
        const matched = FoodDatabase.filter(f => f.name.includes(q));
        if (!matched.length) { results.innerHTML = '<div class="p-3 text-gray-400 text-sm">未找到食物</div>'; results.classList.remove('hidden'); return; }
        results.innerHTML = matched.map(f => `<button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left" onclick="addFoodToPlan('${f.name}')">
            <span class="font-medium text-gray-800 dark:text-white text-sm">${f.name}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">${f.calories}千卡/${f.unit}</span></button>`).join('');
        results.classList.remove('hidden');
    });
}

function closeAddFoodModal() {
    document.getElementById('addfood-modal-overlay')?.remove();
}

function addFoodToPlan(foodName) {
    const food = FoodDatabase.find(f => f.name === foodName);
    if (!food) return;
    const plan = WeeklyPlan[AppState.currentDay];
    if (!plan || !plan[currentAddMealKey]) return;

    plan[currentAddMealKey].push({
        name: food.name,
        calories: food.calories,
        amount: '100g',
        image: ''
    });

    renderDailyPlan();
    closeAddFoodModal();
    showToast(`已添加${food.name}到${AppState.currentDay}`);
}

// ========== 营养计算器 ==========
function handleFoodSearch(e) {
    const q = e.target.value.toLowerCase().trim();
    const results = document.getElementById('food-search-results');
    if (!results) return;
    if (q.length < 1) { results.innerHTML = ''; results.classList.add('hidden'); return; }
    const matched = FoodDatabase.filter(f => f.name.includes(q));
    if (!matched.length) { results.innerHTML = '<div class="p-3 text-gray-400 text-sm">未找到食物</div>'; results.classList.remove('hidden'); return; }
    results.innerHTML = matched.map(f => `<button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left" onclick="addFoodToCalculator('${f.name}');document.getElementById('food-search-results').classList.add('hidden');document.getElementById('food-search').value=''">
        <span class="font-medium text-gray-800 dark:text-white text-sm">${f.name}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">${f.calories}千卡/${f.unit}</span></button>`).join('');
    results.classList.remove('hidden');
}

function addFoodToCalculator(name) {
    const food = FoodDatabase.find(f => f.name === name);
    if (!food) return;
    const existing = AppState.calculatorFoods.find(f => f.name === name);
    if (existing) { existing.amount += 100; }
    else { AppState.calculatorFoods.push({ ...food, amount: 100 }); }
    renderCalculator();
    showToast(`已添加 ${food.name}`);
}

function updateFoodAmount(idx, delta) {
    const food = AppState.calculatorFoods[idx];
    if (!food) return;
    food.amount = Math.max(50, food.amount + delta * 50);
    renderCalculator();
}

function removeFood(idx) {
    AppState.calculatorFoods.splice(idx, 1);
    renderCalculator();
}

function renderCalculator() {
    const list = document.getElementById('food-list');
    const stats = document.getElementById('calc-stats');
    if (!list) return;
    if (!AppState.calculatorFoods.length) {
        list.innerHTML = '<div class="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">搜索并添加食物开始计算</div>';
        if (stats) stats.innerHTML = '';
        return;
    }
    list.innerHTML = AppState.calculatorFoods.map((f, idx) => {
        const ratio = f.amount / 100;
        const cal = Math.round(f.calories * ratio);
        return `<div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors" onclick="openFoodDetail('${f.name}')">
            <div class="flex-1"><div class="font-medium text-gray-800 dark:text-white text-sm">${f.name}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">${f.amount}${f.unit} · ${cal}千卡</div></div>
            <div class="flex items-center space-x-2" onclick="event.stopPropagation()">
                <button onclick="updateFoodAmount(${idx},-1)" class="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm">-</button>
                <span class="text-sm font-medium text-gray-800 dark:text-white w-12 text-center">${f.amount}${f.unit}</span>
                <button onclick="updateFoodAmount(${idx},1)" class="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm">+</button>
                <button onclick="removeFood(${idx})" class="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors text-red-500 text-sm ml-1">×</button>
            </div></div>`;
    }).join('');
    // 计算总计
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0, totalFiber = 0;
    AppState.calculatorFoods.forEach(f => {
        const r = f.amount / 100;
        totalCal += f.calories * r;
        totalP += f.protein * r;
        totalC += f.carbs * r;
        totalF += f.fat * r;
    });
    totalCal = Math.round(totalCal); totalP = Math.round(totalP); totalC = Math.round(totalC); totalF = Math.round(totalF);
    if (stats) {
        stats.innerHTML = `
            <div class="text-center mb-5"><div class="text-4xl font-bold text-gray-800 dark:text-white mb-2">${totalCal}</div><div class="text-gray-500 dark:text-gray-400">总热量 (千卡)</div></div>
            <div class="space-y-3 mb-5">
                <div><div class="flex justify-between text-sm mb-1"><span class="text-gray-600 dark:text-gray-400">蛋白质</span><span class="font-medium text-gray-800 dark:text-white">${totalP}g</span></div>
                <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div class="h-full bg-blue-500 rounded-full transition-all" style="width:${Math.min(totalP / 1.5, 100)}%"></div></div></div>
                <div><div class="flex justify-between text-sm mb-1"><span class="text-gray-600 dark:text-gray-400">碳水化合物</span><span class="font-medium text-gray-800 dark:text-white">${totalC}g</span></div>
                <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div class="h-full bg-yellow-500 rounded-full transition-all" style="width:${Math.min(totalC / 2.5, 100)}%"></div></div></div>
                <div><div class="flex justify-between text-sm mb-1"><span class="text-gray-600 dark:text-gray-400">脂肪</span><span class="font-medium text-gray-800 dark:text-white">${totalF}g</span></div>
                <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div class="h-full bg-green-500 rounded-full transition-all" style="width:${Math.min(totalF / 0.65, 100)}%"></div></div></div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"><h4 class="font-medium text-gray-800 dark:text-white mb-2">热量换算</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="flex justify-between"><span class="text-gray-500">1g 蛋白质</span><span class="text-gray-800 dark:text-white">4 千卡</span></div>
                <div class="flex justify-between"><span class="text-gray-500">1g 碳水</span><span class="text-gray-800 dark:text-white">4 千卡</span></div>
                <div class="flex justify-between"><span class="text-gray-500">1g 脂肪</span><span class="text-gray-800 dark:text-white">9 千卡</span></div>
                <div class="flex justify-between"><span class="text-gray-500">1g 酒精</span><span class="text-gray-800 dark:text-white">7 千卡</span></div>
            </div></div>`;
    }
}

// ========== 个人中心 ==========
function renderProfile() {
    const bd = AppState.bodyData;
    const bmi = bd.height > 0 && bd.weight > 0 ? (bd.weight / Math.pow(bd.height / 100, 2)).toFixed(1) : '--';
    const user = AppState.currentUser;

    // 更新用户信息卡片
    const userCard = document.querySelector('#page-profile .bg-gradient-to-r');
    if (userCard && user) {
        userCard.querySelector('h3').textContent = user.username;
    }

    const container = document.getElementById('profile-body-data');
    if (container) {
        container.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"><div class="text-sm text-gray-500 dark:text-gray-400 mb-1">身高</div><div class="text-xl font-bold text-gray-800 dark:text-white">${bd.height} cm</div></div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"><div class="text-sm text-gray-500 dark:text-gray-400 mb-1">当前体重</div><div class="text-xl font-bold text-gray-800 dark:text-white">${bd.weight} kg</div></div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"><div class="text-sm text-gray-500 dark:text-gray-400 mb-1">目标体重</div><div class="text-xl font-bold text-primary-500">${bd.targetWeight} kg</div></div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"><div class="text-sm text-gray-500 dark:text-gray-400 mb-1">BMI</div><div class="text-xl font-bold text-gray-800 dark:text-white">${bmi}</div></div>
            </div>
            <button onclick="openBodyDataModal()" class="w-full mt-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium transition-colors">更新身体数据</button>`;
    }
    // 统计
    const stats = document.getElementById('profile-stats');
    if (stats) {
        stats.innerHTML = `
            <div class="text-center"><div class="text-2xl font-bold">${AppState.favorites.length}</div><div class="text-white/80 text-sm">收藏食谱</div></div>
            <div class="text-center"><div class="text-2xl font-bold">${AppState.browsingHistory.length}</div><div class="text-white/80 text-sm">浏览记录</div></div>
            <div class="text-center"><div class="text-2xl font-bold">${bd.weight > bd.targetWeight ? (bd.weight - bd.targetWeight).toFixed(1) : '0'}</div><div class="text-white/80 text-sm">待减重(kg)</div></div>`;
    }
    // 收藏列表
    const favList = document.getElementById('profile-favorites');
    if (favList) {
        const favRecipes = RecipeData.filter(r => AppState.favorites.includes(r.id));
        if (favRecipes.length) {
            favList.innerHTML = favRecipes.map(r => `<div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors" onclick="navigateTo('recipes');openRecipeModal(${r.id})">
                <img src="${r.image}" class="w-12 h-12 rounded-lg object-cover mr-3 flex-shrink-0" alt="">
                <div class="flex-1 min-w-0"><div class="font-medium text-gray-800 dark:text-white text-sm">${r.name}</div><div class="text-xs text-gray-500 dark:text-gray-400">${r.category} · ${r.calories}千卡</div></div>
                <svg class="w-5 h-5 text-red-400 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg></div>`).join('');
        } else {
            favList.innerHTML = '<div class="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">暂无收藏食谱</div>';
        }
    }
    // 浏览历史
    const histList = document.getElementById('profile-history');
    if (histList) {
        const histRecipes = AppState.browsingHistory.slice(0, 10).map(h => RecipeData.find(r => r.id === h.id)).filter(Boolean);
        if (histRecipes.length) {
            histList.innerHTML = histRecipes.map(r => `<div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors" onclick="navigateTo('recipes');openRecipeModal(${r.id})">
                <img src="${r.image}" class="w-12 h-12 rounded-lg object-cover mr-3 flex-shrink-0" alt="">
                <div class="flex-1 min-w-0"><div class="font-medium text-gray-800 dark:text-white text-sm">${r.name}</div><div class="text-xs text-gray-500 dark:text-gray-400">${r.category}</div></div></div>`).join('');
        } else {
            histList.innerHTML = '<div class="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">暂无浏览记录</div>';
        }
    }
    // 目标设置显示
    const goalDisplay = document.getElementById('profile-goal');
    if (goalDisplay) {
        goalDisplay.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm text-gray-500 dark:text-gray-400">每日热量目标</span>
                <span class="font-bold text-gray-800 dark:text-white">${AppState.nutritionGoal.calories} 千卡</span>
            </div>
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm text-gray-500 dark:text-gray-400">蛋白质目标</span>
                <span class="font-bold text-gray-800 dark:text-white">${AppState.nutritionGoal.protein}g</span>
            </div>
            <button onclick="openGoalModal()" class="w-full mt-2 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">修改目标</button>`;
    }
}

// ========== 食材详情弹窗 ==========
function openIngredientDetail(id) {
    const item = IngredientData.find(i => i.id === id);
    if (!item) return;
    const relatedRecipes = RecipeData.filter(r => r.ingredients.some(ing => ing.name === item.name));
    const modal = DOM.modalContent;
    if (!modal) return;
    modal.innerHTML = `<div class="h-full overflow-y-auto">
        <div class="relative h-56 md:h-72">
            <img src="${item.image}" class="w-full h-full object-cover" alt="${item.name}">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <button onclick="closeRecipeModal()" class="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <svg class="w-5 h-5 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div class="absolute bottom-4 left-4 right-4">
                <div class="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span class="px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">${item.category}</span>
                    <span class="px-3 py-1 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-xs font-medium rounded-full backdrop-blur-sm">${item.unit}</span>
                    ${renderMealTags(getMealTypes(item.name))}
                </div>
                <h2 class="text-2xl font-bold text-white">${item.name}</h2>
            </div>
        </div>
        <div class="p-5">
            <div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">营养成分（每${item.unit}）</h3>
                <div class="grid grid-cols-4 gap-2">
                    <div class="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl"><div class="text-lg font-bold text-red-600 dark:text-red-400">${item.calories}</div><div class="text-xs text-gray-500">千卡</div></div>
                    <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><div class="text-lg font-bold text-blue-600 dark:text-blue-400">${item.protein}g</div><div class="text-xs text-gray-500">蛋白质</div></div>
                    <div class="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl"><div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">${item.carbs}g</div><div class="text-xs text-gray-500">碳水</div></div>
                    <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl"><div class="text-lg font-bold text-green-600 dark:text-green-400">${item.fat}g</div><div class="text-xs text-gray-500">脂肪</div></div>
                </div>
            </div>
            <div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">食材优势</h3>
                <div class="flex flex-wrap gap-2">
                    ${item.benefits.map(b => `<span class="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium">${b}</span>`).join('')}
                </div>
            </div>
            ${item.substitutes.length ? `<div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">替代食材</h3>
                <div class="flex flex-wrap gap-2">
                    ${item.substitutes.map(s => `<span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">${s}</span>`).join('')}
                </div>
            </div>` : ''}
            ${relatedRecipes.length ? `<div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">相关食谱</h3>
                <div class="space-y-2">
                    ${relatedRecipes.slice(0, 4).map(r => `<button onclick="closeRecipeModal();setTimeout(()=>openRecipeModal(${r.id}),350)" class="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors text-left">
                        <img src="${r.image}" class="w-12 h-12 rounded-lg object-cover mr-3 flex-shrink-0" alt="">
                        <div class="flex-1 min-w-0"><div class="font-medium text-gray-800 dark:text-white text-sm">${r.name}</div><div class="text-xs text-gray-500 dark:text-gray-400">${r.category} · ${r.calories}千卡 · ${r.cookingTime}分钟</div></div>
                        ${r.video ? '<svg class="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' : ''}
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>`).join('')}
                </div>
            </div>` : ''}
            <button onclick="addFoodToCalculator('${item.name}');closeRecipeModal()" class="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                添加到营养计算器
            </button>
        </div></div>`;
    DOM.recipeModal?.classList.remove('hidden');
    setTimeout(() => modal.classList.add('show'), 10);
}

// ========== 食物详情弹窗 ==========
function openFoodDetail(name) {
    const food = FoodDatabase.find(f => f.name === name);
    if (!food) { showToast('暂无该食物的详细信息'); return; }
    const relatedRecipes = RecipeData.filter(r => r.ingredients.some(ing => ing.name === name) || r.name.includes(name));
    const modal = DOM.modalContent;
    if (!modal) return;
    modal.innerHTML = `<div class="h-full overflow-y-auto">
        <div class="relative h-48 md:h-60 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <div class="text-center text-white">
                <div class="text-6xl font-bold mb-2">${food.calories}</div>
                <div class="text-white/80">千卡 / ${food.unit}</div>
            </div>
            <button onclick="closeRecipeModal()" class="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div class="absolute bottom-4 left-4 right-4">
                <h2 class="text-2xl font-bold text-white mb-1">${food.name}</h2>
                <div class="flex items-center gap-1.5">${renderMealTags(getMealTypes(food.name))}</div>
            </div>
        </div>
        <div class="p-5">
            <div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">营养成分（每${food.unit}）</h3>
                <div class="grid grid-cols-4 gap-2">
                    <div class="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl"><div class="text-lg font-bold text-red-600 dark:text-red-400">${food.calories}</div><div class="text-xs text-gray-500">千卡</div></div>
                    <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><div class="text-lg font-bold text-blue-600 dark:text-blue-400">${food.protein}g</div><div class="text-xs text-gray-500">蛋白质</div></div>
                    <div class="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl"><div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">${food.carbs}g</div><div class="text-xs text-gray-500">碳水</div></div>
                    <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl"><div class="text-lg font-bold text-green-600 dark:text-green-400">${food.fat}g</div><div class="text-xs text-gray-500">脂肪</div></div>
                </div>
            </div>
            <div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">热量换算</h3>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                    <div class="flex justify-between text-sm"><span class="text-gray-500 dark:text-gray-400">50g（半份）</span><span class="font-medium text-gray-800 dark:text-white">${Math.round(food.calories * 0.5)} 千卡</span></div>
                    <div class="flex justify-between text-sm"><span class="text-gray-500 dark:text-gray-400">100g（1份）</span><span class="font-medium text-gray-800 dark:text-white">${food.calories} 千卡</span></div>
                    <div class="flex justify-between text-sm"><span class="text-gray-500 dark:text-gray-400">200g（2份）</span><span class="font-medium text-gray-800 dark:text-white">${food.calories * 2} 千卡</span></div>
                    <div class="flex justify-between text-sm"><span class="text-gray-500 dark:text-gray-400">500g（5份）</span><span class="font-medium text-gray-800 dark:text-white">${food.calories * 5} 千卡</span></div>
                </div>
            </div>
            ${relatedRecipes.length ? `<div class="mb-5">
                <h3 class="font-bold text-gray-800 dark:text-white mb-3">相关食谱</h3>
                <div class="space-y-2">
                    ${relatedRecipes.slice(0, 3).map(r => `<button onclick="closeRecipeModal();setTimeout(()=>openRecipeModal(${r.id}),350)" class="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors text-left">
                        <img src="${r.image}" class="w-12 h-12 rounded-lg object-cover mr-3 flex-shrink-0" alt="">
                        <div class="flex-1 min-w-0"><div class="font-medium text-gray-800 dark:text-white text-sm">${r.name}</div><div class="text-xs text-gray-500 dark:text-gray-400">${r.category} · ${r.calories}千卡</div></div>
                        ${r.video ? '<svg class="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' : ''}
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>`).join('')}
                </div>
            </div>` : ''}
            <button onclick="addFoodToCalculator('${food.name}');closeRecipeModal()" class="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                添加到营养计算器
            </button>
        </div></div>`;
    DOM.recipeModal?.classList.remove('hidden');
    setTimeout(() => modal.classList.add('show'), 10);
}

// ========== 身体数据模态框 ==========
function openBodyDataModal() {
    const bd = AppState.bodyData;
    const overlay = document.createElement('div');
    overlay.id = 'bodydata-modal-overlay';
    overlay.className = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4';
    overlay.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">更新身体数据</h3>
        <div class="space-y-4">
            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">身高 (cm)</label>
            <input type="number" id="input-height" value="${bd.height}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"></div>
            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">当前体重 (kg)</label>
            <input type="number" id="input-weight" value="${bd.weight}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"></div>
            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">目标体重 (kg)</label>
            <input type="number" id="input-target" value="${bd.targetWeight}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"></div>
            <div id="bmi-preview" class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"></div>
        </div>
        <div class="flex space-x-3 mt-6">
            <button onclick="closeBodyDataModal()" class="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-medium transition-colors">取消</button>
            <button onclick="saveBodyData()" class="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">保存</button>
        </div></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeBodyDataModal(); });
    // BMI实时预览
    const updateBMI = () => {
        const h = parseFloat(document.getElementById('input-height')?.value) || 0;
        const w = parseFloat(document.getElementById('input-weight')?.value) || 0;
        const preview = document.getElementById('bmi-preview');
        if (preview && h > 0 && w > 0) {
            const bmi = (w / Math.pow(h / 100, 2)).toFixed(1);
            let status = '正常', color = 'text-green-600 dark:text-green-400';
            if (bmi < 18.5) { status = '偏瘦'; color = 'text-blue-600 dark:text-blue-400'; }
            else if (bmi >= 24) { status = '偏胖'; color = 'text-orange-600 dark:text-orange-400'; }
            else if (bmi >= 28) { status = '肥胖'; color = 'text-red-600 dark:text-red-400'; }
            preview.innerHTML = `<span class="text-gray-500 dark:text-gray-400">BMI: </span><span class="font-bold ${color}">${bmi}</span><span class="text-gray-500 dark:text-gray-400 ml-2">${status}</span>`;
        }
    };
    document.getElementById('input-height')?.addEventListener('input', updateBMI);
    document.getElementById('input-weight')?.addEventListener('input', updateBMI);
    updateBMI();
}

function closeBodyDataModal() {
    document.getElementById('bodydata-modal-overlay')?.remove();
}

function saveBodyData() {
    const h = parseFloat(document.getElementById('input-height')?.value) || 0;
    const w = parseFloat(document.getElementById('input-weight')?.value) || 0;
    const t = parseFloat(document.getElementById('input-target')?.value) || 0;
    if (h > 0 && w > 0) {
        AppState.bodyData = { height: h, weight: w, targetWeight: t || w };
        localStorage.setItem('bodyData', JSON.stringify(AppState.bodyData));
        closeBodyDataModal();
        renderProfile();
        showToast('身体数据已更新');
    } else {
        showToast('请输入有效的身高和体重');
    }
}

// ========== 目标设置模态框 ==========
function openGoalModal() {
    const g = AppState.nutritionGoal;
    const overlay = document.createElement('div');
    overlay.id = 'goal-modal-overlay';
    overlay.className = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4';
    overlay.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">设置营养目标</h3>
        <div class="space-y-4">
            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">每日热量目标 (千卡)</label>
            <input type="number" id="goal-calories" value="${g.calories}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"></div>
            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">蛋白质目标 (g)</label>
            <input type="number" id="goal-protein" value="${g.protein}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"></div>
            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">碳水目标 (g)</label>
            <input type="number" id="goal-carbs" value="${g.carbs}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"></div>
            <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">脂肪目标 (g)</label>
            <input type="number" id="goal-fat" value="${g.fat}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"></div>
        </div>
        <div class="flex space-x-3 mt-6">
            <button onclick="closeGoalModal()" class="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-medium transition-colors">取消</button>
            <button onclick="saveGoal()" class="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">保存</button>
        </div></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeGoalModal(); });
}

function closeGoalModal() {
    document.getElementById('goal-modal-overlay')?.remove();
}

function saveGoal() {
    AppState.nutritionGoal = {
        calories: parseInt(document.getElementById('goal-calories')?.value) || 2000,
        protein: parseInt(document.getElementById('goal-protein')?.value) || 120,
        carbs: parseInt(document.getElementById('goal-carbs')?.value) || 250,
        fat: parseInt(document.getElementById('goal-fat')?.value) || 65
    };
    localStorage.setItem('nutritionGoal', JSON.stringify(AppState.nutritionGoal));
    closeGoalModal();
    renderProfile();
    showToast('营养目标已更新');
}

// ========== 饮食小贴士刷新 ==========
function refreshTip() {
    AppState.tipIndex = (AppState.tipIndex + 1) % HealthTips.length;
    renderTips();
}

function renderTips() {
    const container = document.getElementById('tips-container');
    if (!container) return;
    const tip = HealthTips[AppState.tipIndex];
    const colors = ['green', 'blue', 'orange', 'purple', 'yellow'];
    const c = colors[AppState.tipIndex % colors.length];
    container.innerHTML = `<div class="p-4 bg-gradient-to-r from-${c}-50 to-${c}-100 dark:from-${c}-900/20 dark:to-${c}-800/20 rounded-xl border border-${c}-100 dark:border-${c}-800/30">
        <div class="flex items-start">
            <div class="w-8 h-8 rounded-lg bg-${c}-100 dark:bg-${c}-800/30 flex items-center justify-center mr-3 flex-shrink-0">
                <svg class="w-4 h-4 text-${c}-600 dark:text-${c}-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            <div><h4 class="font-medium text-gray-800 dark:text-white mb-1">${tip.title}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">${tip.content}</p></div>
        </div></div>`;
}

// ========== 每日打卡系统 ==========
function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadCheckinData() {
    try {
        const raw = localStorage.getItem('checkinData');
        if (!raw) return { date: '', checked: false, meals: {} };
        const data = JSON.parse(raw);
        if (data.date !== getTodayKey()) {
            return { date: getTodayKey(), checked: false, meals: {} };
        }
        return data;
    } catch { return { date: getTodayKey(), checked: false, meals: {} }; }
}

function saveCheckinData(data) {
    data.date = getTodayKey();
    localStorage.setItem('checkinData', JSON.stringify(data));
}

AppState.checkin = loadCheckinData();

// 加载一周打卡数据
function loadWeeklyCheckinData() {
    try {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const today = getTodayKey();
        const lastResetDate = localStorage.getItem('lastWeeklyResetDate');
        
        // 如果是周一且今天还没重置过，清空一周数据
        if (dayOfWeek === 1 && lastResetDate !== today) {
            localStorage.setItem('lastWeeklyResetDate', today);
            localStorage.removeItem('weeklyCheckinData');
            return {};
        }
        
        const raw = localStorage.getItem('weeklyCheckinData');
        if (!raw) return {};
        
        const data = JSON.parse(raw);
        // 清理无效数据（确保只有已打卡的天才保留）
        const cleanData = {};
        for (const day in data) {
            if (data[day] && data[day].checked) {
                cleanData[day] = data[day];
            }
        }
        return cleanData;
    } catch { return {}; }
}

function saveWeeklyCheckinData(data) {
    localStorage.setItem('weeklyCheckinData', JSON.stringify(data));
}

// 强制清除旧的打卡数据，重新开始
const WEEKLY_DATA_VERSION = 'v2';
const currentVersion = localStorage.getItem('weeklyDataVersion');
if (currentVersion !== WEEKLY_DATA_VERSION) {
    localStorage.removeItem('weeklyCheckinData');
    localStorage.removeItem('checkinData');
    localStorage.removeItem('lastWeeklyResetDate');
    localStorage.setItem('weeklyDataVersion', WEEKLY_DATA_VERSION);
}

AppState.weeklyCheckin = loadWeeklyCheckinData();

// 获取今天的星期几（周一到周日）
function getTodayDayOfWeek() {
    const day = new Date().getDay(); // 0=周日, 1=周一, ...
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[day];
}

function doCheckin() {
    const day = AppState.currentDay;
    const plan = WeeklyPlan[day] || WeeklyPlan['周一'];
    const totalCal = (plan.breakfast.reduce((s, i) => s + i.calories, 0) +
                     plan.lunch.reduce((s, i) => s + i.calories, 0) +
                     plan.dinner.reduce((s, i) => s + i.calories, 0));
    
    // 更新一周打卡数据（按天存储）
    AppState.weeklyCheckin[day] = {
        checked: true,
        calories: totalCal
    };
    saveWeeklyCheckinData(AppState.weeklyCheckin);
    
    // 如果打卡的是今天，也更新今日打卡数据
    if (day === getTodayDayOfWeek()) {
        AppState.checkin = {
            date: getTodayKey(),
            checked: true,
            meals: {
                breakfast: plan.breakfast.reduce((s, i) => s + i.calories, 0),
                lunch: plan.lunch.reduce((s, i) => s + i.calories, 0),
                dinner: plan.dinner.reduce((s, i) => s + i.calories, 0)
            },
            details: {
                breakfast: plan.breakfast.map(i => i.name).join(' + '),
                lunch: plan.lunch.map(i => i.name).join(' + '),
                dinner: plan.dinner.map(i => i.name).join(' + ')
            }
        };
        saveCheckinData(AppState.checkin);
        renderCheckin();
    }
    
    renderWeeklyOverview();
    renderDailyPlan();
    if (day === getTodayDayOfWeek()) {
        renderNutritionOverview();
        initChartsSafe();
    }
    showToast(`${day}打卡成功！`);
}

function undoCheckin() {
    const day = AppState.currentDay;
    
    // 更新一周打卡数据
    AppState.weeklyCheckin[day] = {
        checked: false,
        calories: 0
    };
    saveWeeklyCheckinData(AppState.weeklyCheckin);
    
    // 如果取消的是今天，也更新今日打卡数据
    if (day === getTodayDayOfWeek()) {
        AppState.checkin = { date: getTodayKey(), checked: false, meals: {} };
        saveCheckinData(AppState.checkin);
        renderCheckin();
        renderNutritionOverview();
        initChartsSafe();
    }
    
    renderWeeklyOverview();
    renderDailyPlan();
    showToast(`已取消${day}打卡`);
}

function renderCheckin() {
    const container = document.getElementById('checkin-section');
    if (!container) return;
    const today = getTodayDayOfWeek();
    const dayCheckin = AppState.weeklyCheckin[today];
    const isChecked = dayCheckin && dayCheckin.checked;
    const c = AppState.checkin;
    const total = isChecked ? (c.meals.breakfast || 0) + (c.meals.lunch || 0) + (c.meals.dinner || 0) : 0;
    const goal = AppState.nutritionGoal.calories;
    const pct = isChecked ? Math.round(total / goal * 100) : 0;

    if (!isChecked) {
        container.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white">今日饮食打卡</h3>
                <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs font-medium">未打卡</span>
            </div>
            <div class="text-center py-8">
                <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                    <svg class="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <p class="text-gray-500 dark:text-gray-400 mb-4 text-sm">今日尚未打卡，记录饮食获取健康数据</p>
                <button onclick="doTodayCheckin()" class="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <svg class="w-5 h-5 inline mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    点击打卡
                </button>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">今日饮食打卡</h3>
            <span class="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-medium">✓ 已打卡</span>
        </div>
        <div class="space-y-3 mb-4">
            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3"><span class="text-lg">🌅</span></div>
                <div class="flex-1"><div class="font-medium text-gray-800 dark:text-white text-sm">早餐</div><div class="text-xs text-gray-500 dark:text-gray-400">${c.details?.breakfast || '-'}</div></div>
                <div class="text-right"><div class="font-bold text-gray-800 dark:text-white text-sm">${c.meals.breakfast || 0}</div><div class="text-xs text-gray-500 dark:text-gray-400">千卡</div></div>
            </div>
            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div class="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3"><span class="text-lg">☀️</span></div>
                <div class="flex-1"><div class="font-medium text-gray-800 dark:text-white text-sm">午餐</div><div class="text-xs text-gray-500 dark:text-gray-400">${c.details?.lunch || '-'}</div></div>
                <div class="text-right"><div class="font-bold text-gray-800 dark:text-white text-sm">${c.meals.lunch || 0}</div><div class="text-xs text-gray-500 dark:text-gray-400">千卡</div></div>
            </div>
            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3"><span class="text-lg">🌙</span></div>
                <div class="flex-1"><div class="font-medium text-gray-800 dark:text-white text-sm">晚餐</div><div class="text-xs text-gray-500 dark:text-gray-400">${c.details?.dinner || '-'}</div></div>
                <div class="text-right"><div class="font-bold text-gray-800 dark:text-white text-sm">${c.meals.dinner || 0}</div><div class="text-xs text-gray-500 dark:text-gray-400">千卡</div></div>
            </div>
        </div>
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">今日摄入</span>
            <span class="text-sm font-bold text-gray-800 dark:text-white">${total} / ${goal} 千卡 (${pct}%)</span>
        </div>
        <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
            <div class="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500" style="width:${Math.min(pct, 100)}%"></div>
        </div>
        <div class="flex space-x-3">
            <button onclick="navigateTo('plan')" class="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl text-sm font-medium transition-all duration-200">查看详情</button>
            <button onclick="undoTodayCheckin()" class="py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium transition-colors">取消打卡</button>
        </div>`;
}

// 首页今日打卡（独立函数）
function doTodayCheckin() {
    const today = getTodayDayOfWeek();
    const plan = WeeklyPlan[today] || WeeklyPlan['周一'];
    const totalCal = (plan.breakfast.reduce((s, i) => s + i.calories, 0) +
                     plan.lunch.reduce((s, i) => s + i.calories, 0) +
                     plan.dinner.reduce((s, i) => s + i.calories, 0));
    
    // 更新一周打卡数据
    AppState.weeklyCheckin[today] = {
        checked: true,
        calories: totalCal
    };
    saveWeeklyCheckinData(AppState.weeklyCheckin);
    
    // 更新今日打卡数据
    AppState.checkin = {
        date: getTodayKey(),
        checked: true,
        meals: {
            breakfast: plan.breakfast.reduce((s, i) => s + i.calories, 0),
            lunch: plan.lunch.reduce((s, i) => s + i.calories, 0),
            dinner: plan.dinner.reduce((s, i) => s + i.calories, 0)
        },
        details: {
            breakfast: plan.breakfast.map(i => i.name).join(' + '),
            lunch: plan.lunch.map(i => i.name).join(' + '),
            dinner: plan.dinner.map(i => i.name).join(' + ')
        }
    };
    saveCheckinData(AppState.checkin);
    
    renderCheckin();
    renderWeeklyOverview();
    renderNutritionOverview();
    initChartsSafe();
    showToast('今日打卡成功！');
}

// 首页取消今日打卡（独立函数）
function undoTodayCheckin() {
    const today = getTodayDayOfWeek();
    
    // 更新一周打卡数据
    AppState.weeklyCheckin[today] = {
        checked: false,
        calories: 0
    };
    saveWeeklyCheckinData(AppState.weeklyCheckin);
    
    // 更新今日打卡数据
    AppState.checkin = { date: getTodayKey(), checked: false, meals: {} };
    saveCheckinData(AppState.checkin);
    
    renderCheckin();
    renderWeeklyOverview();
    renderNutritionOverview();
    initChartsSafe();
    showToast('已取消今日打卡');
}

// 渲染7天概览
function renderWeeklyOverview() {
    const container = document.getElementById('weekly-overview');
    if (!container) return;
    
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const weeklyData = AppState.weeklyCheckin;
    
    container.innerHTML = days.map(day => {
        const dayData = weeklyData[day];
        const isChecked = dayData && dayData.checked;
        const calories = dayData ? dayData.calories : 0;
        
        if (isChecked) {
            return `<div class="text-center">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">${day}</div>
                <div class="w-full aspect-square bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <span class="text-lg">✓</span>
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">${calories.toLocaleString()}</div>
            </div>`;
        } else {
            return `<div class="text-center">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">${day}</div>
                <div class="w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <span class="text-lg text-gray-400">-</span>
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">未记录</div>
            </div>`;
        }
    }).join('');
}

// 每分钟检查是否跨天/跨周，自动清零
function startMidnightChecker() {
    function checkDate() {
        const today = getTodayKey();
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=周日, 1=周一, ...
        
        // 检查是否跨天
        if (AppState.checkin.date && AppState.checkin.date !== today) {
            AppState.checkin = { date: today, checked: false, meals: {} };
            saveCheckinData(AppState.checkin);
            renderCheckin();
            showToast('新的一天开始了，今日摄入已清零');
        }
        
        // 检查是否是周一，清空一周打卡数据
        const lastResetDate = localStorage.getItem('lastWeeklyResetDate');
        if (dayOfWeek === 1 && lastResetDate !== today) {
            AppState.weeklyCheckin = {};
            saveWeeklyCheckinData(AppState.weeklyCheckin);
            localStorage.setItem('lastWeeklyResetDate', today);
            renderWeeklyOverview();
            showToast('新的一周开始了，7天概览已清空');
        }
    }
    setInterval(checkDate, 60000);
    checkDate();
}

// ========== 餐食类型分类 ==========
function getMealTypes(name) {
    const meals = [];
    const breakfastKw = ['粥', '燕麦', '酸奶', '三明治', '吐司', '面包', '蛋', '牛奶', '豆浆', '煎饼', '饭团', '紫薯'];
    const lunchKw = ['饭', '面', '意面', '牛排', '鸡腿', '烤', '炒', '蒸', '煎', '三文鱼', '鲈鱼', '虾', '牛肉', '鸡胸', '豆腐', '糙米', '藜麦'];
    const dinnerKw = ['沙拉', '汤', '蔬菜汤', '轻食', '低卡', '凉拌', '味噌'];
    if (breakfastKw.some(k => name.includes(k))) meals.push('早餐');
    if (lunchKw.some(k => name.includes(k))) meals.push('午餐');
    if (dinnerKw.some(k => name.includes(k))) meals.push('晚餐');
    if (!meals.length) meals.push('午餐');
    return [...new Set(meals)];
}

function renderMealTags(mealTypes) {
    const colors = { '早餐': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', '午餐': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', '晚餐': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' };
    const icons = { '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙' };
    return mealTypes.map(m => `<span class="px-1.5 py-0.5 ${colors[m]} rounded text-xs inline-flex items-center"><span class="mr-0.5">${icons[m]}</span>${m}</span>`).join('');
}

// ========== 首页轮播渲染 ==========
AppState.carouselIndex = 0;

function renderCarousel() {
    const container = document.getElementById('daily-carousel');
    if (!container || typeof RecipeData === 'undefined') return;
    const start = AppState.carouselIndex;
    const items = [];
    for (let i = 0; i < 6; i++) {
        items.push(RecipeData[(start + i) % RecipeData.length]);
    }
    const categoryColors = {
        '减脂': 'primary', '增肌': 'accent', '控糖': 'blue', '养胃': 'purple', '低卡': 'yellow'
    };
    container.innerHTML = items.map(r => {
        const color = categoryColors[r.category] || 'primary';
        const isFav = AppState.favorites.includes(r.id);
        return `<div class="flex-none w-64 md:w-72 snap-start">
            <div onclick="openRecipeModal(${r.id})" class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <div class="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <img src="${r.image}" alt="${r.name}" class="w-full h-full object-cover" loading="lazy">
                    <div class="absolute top-3 left-3 flex items-center gap-1">
                        <span class="px-2 py-0.5 bg-white/90 dark:bg-gray-800/90 rounded-full text-xs font-medium text-${color}-600 dark:text-${color}-400 backdrop-blur-sm">${r.category}</span>
                        ${renderMealTags(getMealTypes(r.name))}
                    </div>
                    <button onclick="event.stopPropagation();toggleFavorite(${r.id})" class="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <svg class="w-4 h-4 ${isFav ? 'text-red-500 fill-current' : 'text-gray-500 dark:text-gray-400'}" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    </button>
                </div>
                <div class="p-4">
                    <h4 class="font-bold text-gray-800 dark:text-white mb-2 text-sm">${r.name}</h4>
                    <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span class="flex items-center mr-3"><svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>${r.cookingTime}分钟</span>
                        <span class="flex items-center"><svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>${r.calories}千卡</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-1">
                            <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">${r.difficulty}</span>
                            ${r.video ? '<svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' : ''}
                        </div>
                        <span class="text-xs font-medium text-primary-600 dark:text-primary-400">查看详情 →</span>
                    </div>
                </div>
            </div></div>`;
    }).join('');
}

function refreshCarousel() {
    AppState.carouselIndex = (AppState.carouselIndex + 3) % RecipeData.length;
    renderCarousel();
    showToast('已刷新推荐食谱');
}

// ========== 分类跳转 ==========
function goToCategory(cat) {
    navigateTo('recipes');
    setTimeout(() => {
        AppState.currentRecipeFilter = cat;
        AppState.currentMealFilter = '';
        document.querySelectorAll('.filter-tag').forEach(t => {
            t.classList.toggle('active', t.textContent.trim() === cat);
        });
        document.querySelectorAll('.filter-meal').forEach(t => {
            t.classList.remove('bg-orange-100', 'dark:bg-orange-900/30', 'bg-yellow-100', 'dark:bg-yellow-900/30', 'bg-purple-100', 'dark:bg-purple-900/30');
            t.classList.add('bg-white', 'dark:bg-gray-800');
        });
        renderRecipeList();
    }, 50);
}

// ========== 图表周期切换 ==========
let currentChartPeriod = 'week';

const monthData = {
    labels: ['第1周', '第2周', '第3周', '第4周'],
    calories: [12800, 13200, 11900, 14000],
    target: 14000
};

function switchChartPeriod(period) {
    currentChartPeriod = period;
    const weekBtn = document.getElementById('chart-week-btn');
    const monthBtn = document.getElementById('chart-month-btn');
    if (period === 'week') {
        weekBtn.className = 'px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium';
        monthBtn.className = 'px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors';
    } else {
        monthBtn.className = 'px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium';
        weekBtn.className = 'px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors';
    }
    if (typeof initCalorieChart === 'function') initCalorieChart(period);
}

// ========== 首页营养概览渲染 ==========
function renderNutritionOverview() {
    const today = getTodayDayOfWeek();
    const dayCheckin = AppState.weeklyCheckin[today];
    const isChecked = dayCheckin && dayCheckin.checked;
    
    // 未打卡时显示0，已打卡时从checkin数据获取
    let intake;
    if (isChecked && AppState.checkin.checked) {
        intake = {
            calories: AppState.checkin.meals ? (AppState.checkin.meals.breakfast || 0) + (AppState.checkin.meals.lunch || 0) + (AppState.checkin.meals.dinner || 0) : 0,
            protein: Math.round(((AppState.checkin.meals ? (AppState.checkin.meals.breakfast || 0) + (AppState.checkin.meals.lunch || 0) + (AppState.checkin.meals.dinner || 0) : 0) * 0.2) / 4),
            carbs: Math.round(((AppState.checkin.meals ? (AppState.checkin.meals.breakfast || 0) + (AppState.checkin.meals.lunch || 0) + (AppState.checkin.meals.dinner || 0) : 0) * 0.5) / 4),
            fat: Math.round(((AppState.checkin.meals ? (AppState.checkin.meals.breakfast || 0) + (AppState.checkin.meals.lunch || 0) + (AppState.checkin.meals.dinner || 0) : 0) * 0.3) / 9)
        };
    } else {
        intake = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    const goal = AppState.nutritionGoal;
    const cards = [
        { label: '热量', value: intake.calories, target: goal.calories, unit: '千卡', color: 'red', pct: Math.round(intake.calories / goal.calories * 100) },
        { label: '蛋白质', value: intake.protein, target: goal.protein, unit: 'g', color: 'blue', pct: Math.round(intake.protein / goal.protein * 100) },
        { label: '碳水', value: intake.carbs, target: goal.carbs, unit: 'g', color: 'yellow', pct: Math.round(intake.carbs / goal.carbs * 100) },
        { label: '脂肪', value: intake.fat, target: goal.fat, unit: 'g', color: 'green', pct: Math.round(intake.fat / goal.fat * 100) }
    ];
    const icons = {
        red: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
        blue: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
        yellow: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
        green: '<path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79z"/>'
    };
    const grid = document.getElementById('nutrition-overview');
    if (!grid) return;
    grid.innerHTML = cards.map(c => `
        <div onclick="navigateTo('calculator')" class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-xl bg-${c.color}-100 dark:bg-${c.color}-900/30 flex items-center justify-center"><svg class="w-5 h-5 text-${c.color}-500" fill="currentColor" viewBox="0 0 24 24">${icons[c.color]}</svg></div>
                <span class="text-xs text-gray-500 dark:text-gray-400">已摄入</span>
            </div>
            <div class="text-2xl font-bold text-gray-800 dark:text-white mb-1">${c.value.toLocaleString()}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">${c.unit} / ${c.target.toLocaleString()}</div>
            <div class="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-${c.color}-400 to-${c.color}-500 rounded-full transition-all duration-700" style="width:${Math.min(c.pct, 100)}%"></div>
            </div>
        </div>
    `).join('');
}

// ========== 全部渲染 ==========
function renderAll() {
    renderCarousel();
    renderNutritionOverview();
    renderCheckin();
    renderWeeklyOverview();
    renderRecipeList();
    renderIngredientList();
    renderDailyPlan();
    renderCalculator();
    renderProfile();
    renderTips();
    renderPostList();
    loadPosts();
    initCommunityEvents();
    startMidnightChecker();
}

// ========== Toast提示 ==========
function showToast(msg, dur = 2500) {
    const t = document.createElement('div');
    t.className = 'fixed top-4 left-1/2 z-50 px-5 py-2.5 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-xl shadow-lg transition-all duration-300 opacity-0 text-sm font-medium';
    t.style.transform = 'translateX(-50%) translateY(-20px)';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => t.remove(), 300);
    }, dur);
}

// ========== 图表安全初始化 ==========
function initChartsSafe() {
    if (typeof initCalorieChart === 'function') initCalorieChart(currentChartPeriod || 'week');
    if (typeof initNutritionChart === 'function') initNutritionChart();
}

// ========== 社区分享功能 ==========
function createPost() {
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const tag = document.getElementById('post-tag').value;
    const imageInput = document.getElementById('post-image-input');
    
    if (!title || !content) {
        showToast('请输入标题和内容');
        return;
    }
    
    const user = AppState.currentUser;
    if (!user) {
        showToast('请先登录');
        return;
    }
    
    const post = {
        id: Date.now(),
        title,
        content,
        tag,
        author: user.username,
        authorId: user.id,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        image: null
    };
    
    // 处理图片
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            post.image = e.target.result;
            savePost(post);
            clearPostForm();
            showToast('发布成功！');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        savePost(post);
        clearPostForm();
        showToast('发布成功！');
    }
}

function savePost(post) {
    AppState.posts.unshift(post);
    localStorage.setItem('posts', JSON.stringify(AppState.posts));
    renderPostList();
}

function clearPostForm() {
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('post-image-input').value = '';
}

function renderPostList() {
    const container = document.getElementById('post-list');
    if (!container) return;
    
    let posts = [...AppState.posts];
    const filter = AppState.currentPostFilter;
    
    if (filter !== 'all') {
        posts = posts.filter(p => p.tag === filter);
    }
    
    if (!posts.length) {
        container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">暂无帖子</h3>
                <p class="text-gray-500 dark:text-gray-400">分享您的健康饮食心得吧！</p>
            </div>`;
        return;
    }
    
    container.innerHTML = posts.map(post => {
        const timeAgo = getTimeAgo(post.createdAt);
        const isLiked = post.likes.includes(AppState.currentUser?.id);
        const likeCount = post.likes.length;
        const commentCount = post.comments.length;
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
                <!-- 帖子头部 -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3">
                            <span class="text-white font-medium">${post.author.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <div class="font-medium text-gray-800 dark:text-white text-sm">${post.author}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">${timeAgo}</div>
                        </div>
                    </div>
                    <span class="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-xs font-medium">${post.tag}</span>
                </div>
                
                <!-- 帖子内容 -->
                <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">${escapeHtml(post.title)}</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 whitespace-pre-wrap">${escapeHtml(post.content)}</p>
                
                ${post.image ? `<div class="mb-4 rounded-xl overflow-hidden"><img src="${post.image}" alt="帖子图片" class="w-full h-48 object-cover"></div>` : ''}
                
                <!-- 操作按钮 -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button onclick="togglePostLike(${post.id})" class="flex items-center space-x-2 text-sm ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} hover:text-red-500 transition-colors">
                        <svg class="w-5 h-5 ${isLiked ? 'fill-current' : ''}" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                        <span>${likeCount} 赞</span>
                    </button>
                    <button onclick="toggleComments(${post.id})" class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <span>${commentCount} 评论</span>
                    </button>
                    <button onclick="sharePost(${post.id})" class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                        </svg>
                        <span>分享</span>
                    </button>
                </div>
                
                <!-- 评论区域 -->
                <div id="comments-${post.id}" class="hidden mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <!-- 评论列表 -->
                    <div id="comment-list-${post.id}" class="space-y-3 mb-4">
                        ${renderComments(post.comments, post.id)}
                    </div>
                    
                    <!-- 发表评论 -->
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-xs font-medium">${AppState.currentUser ? AppState.currentUser.username.charAt(0).toUpperCase() : '?'}</span>
                        </div>
                        <div class="flex-1">
                            <textarea id="comment-input-${post.id}" placeholder="写评论..." rows="2" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 resize-none"></textarea>
                            <div class="flex justify-end mt-2">
                                <button onclick="addComment(${post.id})" class="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors">发送</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

function renderComments(comments, postId, isReply = false) {
    return comments.map(comment => {
        const timeAgo = getTimeAgo(comment.createdAt);
        const isLiked = comment.likes.includes(AppState.currentUser?.id);
        const likeCount = comment.likes.length;
        
        return `
            <div class="${isReply ? 'ml-8 pt-3 border-t border-gray-50 dark:border-gray-700/50' : ''}">
                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                        <span class="text-white text-xs font-medium">${comment.author.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="font-medium text-gray-800 dark:text-white text-sm">${comment.author}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">${timeAgo}</span>
                        </div>
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">${escapeHtml(comment.content)}</p>
                        <div class="flex items-center space-x-4">
                            <button onclick="toggleCommentLike(${postId}, '${comment.id}')" class="flex items-center space-x-1 text-xs ${isLiked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'} hover:text-red-500 transition-colors">
                                <svg class="w-4 h-4 ${isLiked ? 'fill-current' : ''}" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                                <span>${likeCount}</span>
                            </button>
                            <button onclick="showReplyInput(${postId}, '${comment.id}')" class="text-xs text-gray-400 dark:text-gray-500 hover:text-primary-500 transition-colors">回复</button>
                        </div>
                        <!-- 回复输入框 -->
                        <div id="reply-input-${comment.id}" class="hidden mt-3">
                            <div class="flex items-start space-x-2">
                                <textarea id="reply-text-${comment.id}" placeholder="回复 ${comment.author}..." rows="2" class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 resize-none"></textarea>
                                <button onclick="addReply(${postId}, '${comment.id}')" class="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-medium transition-colors">回复</button>
                            </div>
                        </div>
                        <!-- 回复列表 -->
                        ${comment.replies && comment.replies.length ? `<div class="mt-3 space-y-3">${renderComments(comment.replies, postId, true)}</div>` : ''}
                    </div>
                </div>
            </div>`;
    }).join('');
}

function toggleComments(postId) {
    const container = document.getElementById(`comments-${postId}`);
    if (container) {
        container.classList.toggle('hidden');
    }
}

function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    
    if (!content) {
        showToast('请输入评论内容');
        return;
    }
    
    const user = AppState.currentUser;
    if (!user) {
        showToast('请先登录');
        return;
    }
    
    const post = AppState.posts.find(p => p.id === postId);
    if (!post) return;
    
    const comment = {
        id: 'c' + Date.now(),
        content,
        author: user.username,
        authorId: user.id,
        createdAt: new Date().toISOString(),
        likes: [],
        replies: []
    };
    
    post.comments.push(comment);
    localStorage.setItem('posts', JSON.stringify(AppState.posts));
    input.value = '';
    renderPostList();
    // 重新展开评论区
    setTimeout(() => {
        const container = document.getElementById(`comments-${postId}`);
        if (container) container.classList.remove('hidden');
    }, 10);
    showToast('评论成功！');
}

function showReplyInput(postId, commentId) {
    const replyInput = document.getElementById(`reply-input-${commentId}`);
    if (replyInput) {
        replyInput.classList.toggle('hidden');
        if (!replyInput.classList.contains('hidden')) {
            document.getElementById(`reply-text-${commentId}`).focus();
        }
    }
}

function addReply(postId, commentId) {
    const input = document.getElementById(`reply-text-${commentId}`);
    const content = input.value.trim();
    
    if (!content) {
        showToast('请输入回复内容');
        return;
    }
    
    const user = AppState.currentUser;
    if (!user) {
        showToast('请先登录');
        return;
    }
    
    const post = AppState.posts.find(p => p.id === postId);
    if (!post) return;
    
    // 递归查找评论
    function findComment(comments) {
        for (let comment of comments) {
            if (comment.id === commentId) return comment;
            if (comment.replies) {
                const found = findComment(comment.replies);
                if (found) return found;
            }
        }
        return null;
    }
    
    const parentComment = findComment(post.comments);
    if (!parentComment) return;
    
    const reply = {
        id: 'r' + Date.now(),
        content,
        author: user.username,
        authorId: user.id,
        createdAt: new Date().toISOString(),
        likes: [],
        replies: []
    };
    
    if (!parentComment.replies) parentComment.replies = [];
    parentComment.replies.push(reply);
    
    localStorage.setItem('posts', JSON.stringify(AppState.posts));
    renderPostList();
    // 重新展开评论区
    setTimeout(() => {
        const container = document.getElementById(`comments-${postId}`);
        if (container) container.classList.remove('hidden');
    }, 10);
    showToast('回复成功！');
}

function togglePostLike(postId) {
    const user = AppState.currentUser;
    if (!user) {
        showToast('请先登录');
        return;
    }
    
    const post = AppState.posts.find(p => p.id === postId);
    if (!post) return;
    
    const idx = post.likes.indexOf(user.id);
    if (idx === -1) {
        post.likes.push(user.id);
    } else {
        post.likes.splice(idx, 1);
    }
    
    localStorage.setItem('posts', JSON.stringify(AppState.posts));
    renderPostList();
}

function toggleCommentLike(postId, commentId) {
    const user = AppState.currentUser;
    if (!user) {
        showToast('请先登录');
        return;
    }
    
    const post = AppState.posts.find(p => p.id === postId);
    if (!post) return;
    
    // 递归查找评论
    function findComment(comments) {
        for (let comment of comments) {
            if (comment.id === commentId) return comment;
            if (comment.replies) {
                const found = findComment(comment.replies);
                if (found) return found;
            }
        }
        return null;
    }
    
    const comment = findComment(post.comments);
    if (!comment) return;
    
    const idx = comment.likes.indexOf(user.id);
    if (idx === -1) {
        comment.likes.push(user.id);
    } else {
        comment.likes.splice(idx, 1);
    }
    
    localStorage.setItem('posts', JSON.stringify(AppState.posts));
    renderPostList();
    // 重新展开评论区
    setTimeout(() => {
        const container = document.getElementById(`comments-${postId}`);
        if (container) container.classList.remove('hidden');
    }, 10);
}

function sharePost(postId) {
    const post = AppState.posts.find(p => p.id === postId);
    if (!post) return;
    
    const text = `轻食悦膳社区分享：${post.title}`;
    if (navigator.share) {
        navigator.share({ title: post.title, text: text }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板'));
    } else {
        showToast('分享链接已生成');
    }
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return '刚刚';
    if (seconds < 3600) return Math.floor(seconds / 60) + '分钟前';
    if (seconds < 86400) return Math.floor(seconds / 3600) + '小时前';
    if (seconds < 2592000) return Math.floor(seconds / 86400) + '天前';
    return date.toLocaleDateString('zh-CN');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initCommunityEvents() {
    // 帖子筛选
    document.querySelectorAll('.post-filter').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.post-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            AppState.currentPostFilter = e.target.getAttribute('data-filter');
            renderPostList();
        });
    });
    
    // 图片上传
    document.getElementById('add-image-btn')?.addEventListener('click', () => {
        document.getElementById('post-image-input')?.click();
    });
}

// 初始化时加载帖子数据
function loadPosts() {
    AppState.posts = JSON.parse(localStorage.getItem('posts') || '[]');
}