/**
 * 轻食悦膳 - 图表模块（完整版）
 */
let calorieChartInstance = null;
let nutritionChartInstance = null;

function initCalorieChart(period) {
    const el = document.getElementById('calorie-chart');
    if (!el || typeof echarts === 'undefined') return;
    if (calorieChartInstance) { calorieChartInstance.dispose(); calorieChartInstance = null; }
    calorieChartInstance = echarts.init(el);
    const dark = document.documentElement.classList.contains('dark');
    const tc = dark ? '#9ca3af' : '#6b7280';
    const lc = dark ? '#374151' : '#e5e7eb';
    const goal = (typeof AppState !== 'undefined') ? AppState.nutritionGoal.calories : 2000;
    let xData, yData, yName;

    // 根据打卡状态获取数据
    const today = (typeof getTodayDayOfWeek === 'function') ? getTodayDayOfWeek() : '';
    const weeklyCheckin = (typeof AppState !== 'undefined') ? AppState.weeklyCheckin : {};
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    if (period === 'month') {
        xData = ['第1周', '第2周', '第3周', '第4周'];
        yData = [12800, 13200, 11900, 14000];
        yName = '千卡';
    } else {
        xData = days;
        yData = days.map(day => {
            const dayData = weeklyCheckin[day];
            return (dayData && dayData.checked) ? dayData.calories : 0;
        });
        yName = '千卡';
    }
    calorieChartInstance.setOption({
        tooltip: {
            trigger: 'axis',
            backgroundColor: dark ? '#1f2937' : '#fff',
            borderColor: dark ? '#374151' : '#e5e7eb',
            textStyle: { color: dark ? '#f3f4f6' : '#111827', fontSize: 13 },
            axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(34,197,94,0.08)' } },
            formatter: params => {
                let s = params[0].name + '<br/>';
                params.forEach(p => { s += `${p.marker} ${p.seriesName}: <b>${p.value.toLocaleString()}</b> 千卡<br/>`; });
                return s;
            }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
        xAxis: {
            type: 'category', data: xData,
            axisLine: { lineStyle: { color: lc } },
            axisLabel: { color: tc, fontSize: 12 },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value', name: yName,
            nameTextStyle: { color: tc, fontSize: 12 },
            axisLine: { show: false },
            axisLabel: { color: tc, fontSize: 12 },
            splitLine: { lineStyle: { color: lc, type: 'dashed' } }
        },
        series: [
            {
                name: '热量摄入', type: 'bar', data: yData, barWidth: '55%',
                itemStyle: { borderRadius: [6, 6, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#86efac' }, { offset: 1, color: '#22c55e' }]) },
                emphasis: { itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#4ade80' }, { offset: 1, color: '#16a34a' }]) } },
                label: { show: true, position: 'top', color: tc, fontSize: 11, formatter: p => p.value >= 1000 ? (p.value / 1000).toFixed(1) + 'k' : p.value }
            },
            {
                name: '目标热量', type: 'line',
                data: xData.map(() => period === 'month' ? goal * 7 : goal),
                lineStyle: { color: '#fb923c', type: 'dashed', width: 2 },
                symbol: 'none', itemStyle: { color: '#fb923c' }
            }
        ],
        animationDuration: 600,
        animationEasing: 'cubicOut'
    });
    el._resizeHandler = () => calorieChartInstance && calorieChartInstance.resize();
    window.removeEventListener('resize', el._prevResize);
    el._prevResize = el._resizeHandler;
    window.addEventListener('resize', el._resizeHandler);
    calorieChartInstance.on('click', params => {
        if (params.componentType === 'series' && params.seriesType === 'bar' && params.value > 0) {
            showToast(`${params.name}: ${params.value.toLocaleString()}千卡`);
        }
    });
}

function initNutritionChart() {
    const el = document.getElementById('nutrition-chart');
    if (!el || typeof echarts === 'undefined') return;
    if (nutritionChartInstance) { nutritionChartInstance.dispose(); nutritionChartInstance = null; }
    nutritionChartInstance = echarts.init(el);
    const dark = document.documentElement.classList.contains('dark');
    const tc = dark ? '#9ca3af' : '#6b7280';

    // 根据打卡状态获取数据
    const today = (typeof getTodayDayOfWeek === 'function') ? getTodayDayOfWeek() : '';
    const weeklyCheckin = (typeof AppState !== 'undefined') ? AppState.weeklyCheckin : {};
    const dayData = weeklyCheckin[today];
    let intake;
    if (dayData && dayData.checked && typeof AppState !== 'undefined' && AppState.checkin && AppState.checkin.checked) {
        const totalCal = AppState.checkin.meals ? (AppState.checkin.meals.breakfast || 0) + (AppState.checkin.meals.lunch || 0) + (AppState.checkin.meals.dinner || 0) : 0;
        intake = {
            protein: Math.round(totalCal * 0.2 / 4),
            carbs: Math.round(totalCal * 0.5 / 4),
            fat: Math.round(totalCal * 0.3 / 9)
        };
    } else {
        intake = { protein: 0, carbs: 0, fat: 0 };
    }
    nutritionChartInstance.setOption({
        tooltip: {
            trigger: 'item',
            backgroundColor: dark ? '#1f2937' : '#fff',
            borderColor: dark ? '#374151' : '#e5e7eb',
            textStyle: { color: dark ? '#f3f4f6' : '#111827' },
            formatter: p => `<b>${p.name}</b><br/>${p.value}g (${p.percent}%)`
        },
        legend: {
            orient: 'vertical', right: '5%', top: 'center',
            textStyle: { color: tc, fontSize: 12 },
            itemWidth: 12, itemHeight: 12, itemGap: 15
        },
        series: [{
            name: '营养素', type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: dark ? '#1f2937' : '#fff',
                borderWidth: 2
            },
            label: { show: false, position: 'center' },
            emphasis: {
                label: { show: true, fontSize: 14, fontWeight: 'bold', color: dark ? '#f3f4f6' : '#111827' },
                itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' }
            },
            labelLine: { show: false },
            data: [
                { value: intake.protein, name: '蛋白质', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#93c5fd' }, { offset: 1, color: '#3b82f6' }]) } },
                { value: intake.carbs, name: '碳水化合物', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#fcd34d' }, { offset: 1, color: '#f59e0b' }]) } },
                { value: intake.fat, name: '脂肪', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#86efac' }, { offset: 1, color: '#22c55e' }]) } }
            ],
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: idx => idx * 60
        }],
        animationDuration: 1200
    });
    el._resizeHandler = () => nutritionChartInstance && nutritionChartInstance.resize();
    window.removeEventListener('resize', el._prevResize);
    el._prevResize = el._resizeHandler;
    window.addEventListener('resize', el._resizeHandler);
}

function updateChartsTheme(dark) {
    const tc = dark ? '#9ca3af' : '#6b7280';
    const lc = dark ? '#374151' : '#e5e7eb';
    const bg = dark ? '#1f2937' : '#fff';
    const bc = dark ? '#374151' : '#e5e7eb';
    const sc = dark ? '#f3f4f6' : '#111827';
    if (calorieChartInstance) {
        calorieChartInstance.setOption({
            tooltip: { backgroundColor: bg, borderColor: bc, textStyle: { color: sc } },
            xAxis: { axisLine: { lineStyle: { color: lc } }, axisLabel: { color: tc } },
            yAxis: { nameTextStyle: { color: tc }, axisLabel: { color: tc }, splitLine: { lineStyle: { color: lc } } },
            series: [{ label: { color: tc } }]
        });
    }
    if (nutritionChartInstance) {
        nutritionChartInstance.setOption({
            tooltip: { backgroundColor: bg, borderColor: bc, textStyle: { color: sc } },
            legend: { textStyle: { color: tc } }
        });
    }
}