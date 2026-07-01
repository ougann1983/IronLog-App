// --- 1. 数据库定义 ---
const db = new Dexie('IronLogDB');
db.version(2).stores({
    muscleGroups: '++id, &name',           // 部位表
    exercises: '++id, name, muscleGroupId',// 动作表 (关联 muscleGroupId)
    logs: '++id, exerciseId, weight, reps, timestamp' // 记录表 (关联 exerciseId)
});

// --- 2. 初始化逻辑 ---
async function initializeData() {
    const defaultGroups = ['胸', '肩', '背', '腹', '腿'];
    if (!confirm("此操作将清空现有部位并重置，确认吗？")) return;

    await db.transaction('rw', db.muscleGroups, async () => {
        await db.muscleGroups.clear();
        for (const name of defaultGroups) {
            await db.muscleGroups.add({ name: name });
        }
    });
    alert("初始化完成！");
    refreshUI();
}

// --- 3. 联动逻辑 ---
// 当部位选择改变时，更新动作列表
async function updateExerciseOptions() {
    const groupId = document.getElementById('group-select').value;
    const exSelect = document.getElementById('exercise-select');

    if (!groupId) {
        exSelect.innerHTML = '<option value="">请先选择部位</option>';
        return;
    }

    const exercises = await db.exercises.where('muscleGroupId').equals(parseInt(groupId)).toArray();
    exSelect.innerHTML = exercises.length > 0
        ? exercises.map(e => `<option value="${e.id}">${e.name}</option>`).join('')
        : '<option value="">该部位暂无动作</option>';
}

// --- 4. 增删改查逻辑 ---
async function handleAddLogFromUI() {
    const exerciseId = document.getElementById('exercise-select').value;
    const weight = document.getElementById('weight').value;
    const reps = document.getElementById('reps').value;

    if (!exerciseId || !weight || !reps) return alert("请完整选择部位、动作并填写数据");

    await db.logs.add({
        exerciseId: parseInt(exerciseId),
        weight: parseFloat(weight),
        reps: parseInt(reps),
        timestamp: new Date().toLocaleString()
    });
    refreshUI();
}

async function deleteLog(id) {
    await db.logs.delete(id);
    refreshUI();
}

// --- 5. 页面加载与渲染逻辑 ---
async function refreshUI() {
    // 渲染部位下拉框
    const groupSelect = document.getElementById('group-select');
    const groups = await db.muscleGroups.toArray();
    if (groupSelect) {
        groupSelect.innerHTML = '<option value="">请选择部位</option>' +
            groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    }

    // 渲染总吨位与记录列表
    const logs = await db.logs.toArray();
    const total = logs.reduce((sum, item) => sum + (item.weight * item.reps || 0), 0);
    document.getElementById('total-tonnage').innerText = total;

    const list = document.getElementById('log-list');
    if (list) {
        // 为了展示动作名称，我们需要简单关联一下
        // 注：生产环境建议使用 Dexie.js 的 hook 或者在获取数据时做 join
        list.innerHTML = logs.map(item => `
            <div class="log-item">
                <div>
                    <strong>记录ID: ${item.exerciseId}</strong> | ${item.weight}kg x ${item.reps}次 <br>
                    <small style="color:#888;">${item.timestamp}</small>
                </div>
                <button class="delete-btn" onclick="deleteLog(${item.id})">删除</button>
            </div>
        `).join('');
    }
}

// 检查更新逻辑
async function forceUpdate() {
    window.location.reload(true);
}

// 初始化执行
window.onload = refreshUI;