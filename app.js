// ...前面的 db 初始化代码不变...

async function handleAdd() {
    const action = document.getElementById('action').value;
    const weight = parseFloat(document.getElementById('weight').value);
    if (!action || !weight) return alert("请填写完整！");

    // 写入数据库，加入完整的时间戳
    await db.exercises.add({
        action,
        weight,
        timestamp: new Date().toLocaleString() // 记录保存的那一刻
    });

    document.getElementById('action').value = '';
    document.getElementById('weight').value = '';
    refreshUI();
}

// 删除记录的函数
async function deleteItem(id) {
    await db.exercises.delete(id);
    refreshUI();
}

async function refreshUI() {
    const logs = await db.exercises.toArray();
    const total = logs.reduce((sum, item) => sum + (item.weight || 0), 0);
    document.getElementById('total-tonnage').innerText = total;

    const list = document.getElementById('log-list');
    // 给每行生成“删除”按钮
    list.innerHTML = logs.map(item => `
        <li style="margin-bottom: 10px; border-bottom: 1px solid #ccc;">
            <strong>${item.action}</strong>: ${item.weight}kg <br>
            <small style="color: #666;">${item.timestamp}</small>
            <button onclick="deleteItem(${item.id})">删除</button>
        </li>
    `).join('');
}