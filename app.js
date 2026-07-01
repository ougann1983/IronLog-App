// --- 1. 数据库定义 ---
const db = new Dexie('IronLogDB');
db.version(2).stores({
    muscleGroups: '++id, &name',           // 部位表
    exercises: '++id, name, muscleGroupId',// 动作表 (关联部位)
    logs: '++id, exerciseId, weight, reps, timestamp' // 记录表 (关联动作)
});

// --- 2. 数据库工具逻辑 ---

// 初始化部位数据
async function initializeData() {
    const defaultGroups = ['胸', '肩', '背', '腹', '腿'];

    // 检查是否有数据，防止误删
    const count = await db.muscleGroups.count();
    if (count > 0 && !confirm("数据库已有数据，强制初始化会清空现有部位，确认吗？")) {
        return;
    }

    await db.transaction('rw', db.muscleGroups, async () => {
        await db.muscleGroups.clear();
        for (const name of defaultGroups) {
            await db.muscleGroups.add({ name: name });
        }
    });

    alert("初始化完成！已加载默认部位。");
    refreshUI();
}

// 添加训练记录示例函数 (之后会扩展为带联动功能的)
async function handleAddLog(exerciseId, weight, reps) {
    await db.logs.add({
        exerciseId: exerciseId,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        timestamp: new Date().toLocaleString()
    });
    refreshUI();
}

// 删除记录
async function deleteLog(id) {
    await db.logs.delete(id);
    refreshUI();
}

// --- 3. 界面刷新逻辑 ---
async function refreshUI() {
    // 渲染部位列表 (你可以后续在 UI 中展示这些)
    const groups = await db.muscleGroups.toArray();
    console.log("当前部位:", groups);

    // 渲染记录逻辑 (保持之前的显示)
    const logs = await db.logs.toArray();
    const list = document.getElementById('log-list');

    if (list) {
        list.innerHTML = logs.map(item => `
            <div class="log-item">
                <div>
                    <strong>记录ID: ${item.exerciseId}</strong>: ${item.weight}kg x ${item.reps}次 <br>
                    <small>${item.timestamp}</small>
                </div>
                <button class="delete-btn" onclick="deleteLog(${item.id})">删除</button>
            </div>
        `).join('');
    }
}

// --- 4. 页面加载初始化 ---
window.onload = refreshUI;