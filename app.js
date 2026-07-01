const db = new Dexie("IronLogDB");
db.version(1).stores({ exercises: '++id, action, weight, date' });

// 页面加载时自动刷新列表
window.onload = refreshUI;

async function handleAdd() {
    const action = document.getElementById('action').value;
    const weight = parseFloat(document.getElementById('weight').value);

    // 写入数据库
    await db.exercises.add({ action, weight, date: new Date().toLocaleDateString() });

    // 清空输入框并刷新 UI
    document.getElementById('action').value = '';
    document.getElementById('weight').value = '';
    refreshUI();
}

async function refreshUI() {
    const logs = await db.exercises.toArray();

    // 离线运算：计算所有记录的总重量
    const total = logs.reduce((sum, item) => sum + (item.weight || 0), 0);
    document.getElementById('total-tonnage').innerText = total;

    // 更新列表
    const list = document.getElementById('log-list');
    list.innerHTML = logs.map(item => `<li>${item.action}: ${item.weight}kg</li>`).join('');
}