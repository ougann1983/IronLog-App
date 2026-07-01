const db = new Dexie('IronLogDB');
db.version(1).stores({ exercises: '++id,action,weight,timestamp' });

async function handleAdd() {
    const action = document.getElementById('action').value;
    const weight = parseFloat(document.getElementById('weight').value);
    if (!action || !weight) return alert("请填写完整！");
    await db.exercises.add({ action, weight, timestamp: new Date().toLocaleString() });
    document.getElementById('action').value = '';
    document.getElementById('weight').value = '';
    refreshUI();
}

async function deleteItem(id) {
    await db.exercises.delete(id);
    refreshUI();
}

async function refreshUI() {
    const logs = await db.exercises.toArray();
    const total = logs.reduce((sum, item) => sum + (item.weight || 0), 0);
    document.getElementById('total-tonnage').innerText = total;
    const list = document.getElementById('log-list');
    list.innerHTML = logs.map(item => `
        <div class="log-item">
            <div>
                <strong>${item.action}</strong>: ${item.weight}kg <br>
                <small style="color: #666;">${item.timestamp}</small>
            </div>
            <button class="delete-btn" onclick="deleteItem(${item.id})">删除</button>
        </div>
    `).join('');
}

window.onload = refreshUI;