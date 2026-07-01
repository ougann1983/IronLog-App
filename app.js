// 1. 初始化数据库 (确保这行在最前面，且写在任何函数之外)
const db = new Dexie('IronLogDB');
db.version(1).stores({
    exercises: '++id,action,weight,timestamp'
});

// 2. 页面加载完成后立即初始化显示
window.onload = refreshUI;

// 3. 添加记录逻辑
async function handleAdd() {
    const action = document.getElementById('action').value;
    const weight = parseFloat(document.getElementById('weight').value);

    if (!action || !weight) {
        alert("请填写完整！");
        return;
    }

    // 写入数据库
    await db.exercises.add({
        action,
        weight,
        timestamp: new Date().toLocaleString()
    });

    document.getElementById('action').value = '';
    document.getElementById('weight').value = '';
    refreshUI();
}

// 4. 删除逻辑
async function deleteItem(id) {
    await db.exercises.delete(id);
    refreshUI();
}

// 5. 刷新界面逻辑
async function refreshUI() {
    const logs = await db.exercises.toArray();
    const total = logs.reduce((sum, item) => sum + (item.weight || 0), 0);
    document.getElementById('total-tonnage').innerText = total;

    const list = document.getElementById('log-list');
    list.innerHTML = logs.map(item => `
        <li style="margin-bottom: 10px; border-bottom: 1px solid #ccc;">
            <strong>${item.action}</strong>: ${item.weight}kg <br>
            <small style="color: #666;">${item.timestamp}</small>
            <button onclick="deleteItem(${item.id})">删除</button>
        </li>
    `).join('');
}