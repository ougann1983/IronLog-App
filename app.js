const db = new Dexie('IronLogDB');
db.version(2).stores({
    muscleGroups: '++id, &name',
    exercises: '++id, name, muscleGroupId',
    logs: '++id, exerciseId, weight, reps, timestamp'
});

// 初始化部位
async function initializeData() {
    if (!confirm("这会清空现有部位并重置，确定吗？")) return;
    const groups = ['胸', '肩', '背', '腹', '腿'];
    await db.transaction('rw', db.muscleGroups, async () => {
        await db.muscleGroups.clear();
        for (const name of groups) await db.muscleGroups.add({ name });
    });
    refreshUI();
}

// 刷新 UI 与部位列表
async function refreshUI() {
    // 渲染部位下拉框
    const groupSelect = document.getElementById('group-select');
    const groups = await db.muscleGroups.toArray();
    groupSelect.innerHTML = '<option value="">请选择部位</option>' +
        groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');

    // 渲染记录
    const logs = await db.logs.toArray();
    const total = logs.reduce((sum, item) => sum + (item.weight * item.reps || 0), 0);
    document.getElementById('total-tonnage').innerText = total;

    document.getElementById('log-list').innerHTML = logs.map(item => `
        <div class="log-item">
            <div>ID:${item.exerciseId} | ${item.weight}kg x ${item.reps}次</div>
            <button class="delete-btn" onclick="deleteLog(${item.id})">删除</button>
        </div>
    `).join('');
}

// 联动逻辑：根据部位找动作
async function updateExerciseOptions() {
    const groupId = document.getElementById('group-select').value;
    const exSelect = document.getElementById('exercise-select');
    exSelect.innerHTML = '<option value="">加载中...</option>';

    if (!groupId) {
        exSelect.innerHTML = '<option value="">请先选择部位</option>';
        return;
    }

    const exercises = await db.exercises.where('muscleGroupId').equals(parseInt(groupId)).toArray();
    exSelect.innerHTML = exercises.length > 0
        ? exercises.map(e => `<option value="${e.id}">${e.name}</option>`).join('')
        : '<option value="">该部位暂无动作</option>';
}

// 添加数据逻辑
async function addNewGroup() {
    const name = document.getElementById('new-group-name').value;
    if (!name) return;
    await db.muscleGroups.add({ name });
    document.getElementById('new-group-name').value = '';
    refreshUI();
}

async function addNewExercise() {
    const name = document.getElementById('new-exercise-name').value;
    const groupId = document.getElementById('group-select').value;
    if (!name || !groupId) return alert("请先选择部位");
    await db.exercises.add({ name, muscleGroupId: parseInt(groupId) });
    updateExerciseOptions();
}

async function handleAddLogFromUI() {
    const exerciseId = document.getElementById('exercise-select').value;
    const weight = document.getElementById('weight').value;
    const reps = document.getElementById('reps').value;
    if (!exerciseId || !weight || !reps) return alert("请填写完整");
    await db.logs.add({ exerciseId: parseInt(exerciseId), weight: parseFloat(weight), reps: parseInt(reps), timestamp: new Date().toLocaleTimeString() });
    refreshUI();
}

async function deleteLog(id) {
    await db.logs.delete(id);
    refreshUI();
}

window.onload = refreshUI;