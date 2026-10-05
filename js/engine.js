'use strict';

/* ============================================================
   ИГРОВОЕ СОСТОЯНИЕ
   ============================================================ */
let player = {};
let storyFlags = {};
let dayFlags = {};
let currentScene = null;

let isTransitioning = false;

/* Три пула сцен — наполняются в main.js */
var storyNodesBoy = {};
var storyNodesGirl = {};
var storyNodesCommon = {};

/* ============================================================
   СПИСКИ СЦЕН ДЛЯ ДЕКОРА
   ============================================================ */
const day1ScenesBoy = [
    'b_day1_start','b_day1_breakfast','b_day1_walk',
    'b_day1_lineup','b_day1_yan','b_day1_yan_talk','b_day1_yan_joke','b_day1_yan_cold',
    'b_day1_class','b_day1_class_intro','b_day1_dasha_first','b_day1_lesson1',
    'b_day1_break','b_day1_oleg','b_day1_oleg_talk','b_day1_oleg_joke','b_day1_oleg_sport',
    'b_day1_lesson2','b_day1_pen','b_day1_pen_fight','b_day1_pen_give','b_day1_pen_keep',
    'b_day1_dasha_talk','b_day1_lesson3','b_day1_lesson4','b_day1_after_school',
    'b_day1_walk_home','b_day1_entryway','b_day1_home','b_day1_fridge','b_day1_food'
];

const day1ScenesGirl = [
    'g_day1_start'
];

/* ============================================================
   FAB — плавающее меню
   ============================================================ */
function toggleFab(){
    const c = document.getElementById('fabContainer');
    const i = document.getElementById('fabMainIcon');
    if (!c) return;
    c.classList.toggle('open');
    if (i){
        i.textContent = c.classList.contains('open') ? '✕' : '☰';
    }
}

function closeFab(){
    const c = document.getElementById('fabContainer');
    const i = document.getElementById('fabMainIcon');
    if (c) c.classList.remove('open');
    if (i) i.textContent = '☰';
}

document.addEventListener('click', function(e){
    const c = document.getElementById('fabContainer');
    if (!c) return;
    if (!c.contains(e.target)) {
        c.classList.remove('open');
        const i = document.getElementById('fabMainIcon');
        if (i) i.textContent = '☰';
    }
});

/* ============================================================
   ХЕЛПЕРЫ
   ============================================================ */
function isGirl() { return player.gender === '👧'; }

function getActiveNodes(){
    return isGirl() ? storyNodesGirl : storyNodesBoy;
}

function getNode(id){
    const active = getActiveNodes();
    if (active && active[id]) return active[id];
    if (storyNodesCommon && storyNodesCommon[id]) return storyNodesCommon[id];
    return null;
}

/* ============================================================
   СОЗДАНИЕ ПЕРСОНАЖА
   ============================================================ */
function showCreate(){
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('createScreen').style.display = 'block';
}

function showScreen(id){
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
}

function selectGender(gender, btnId){
    player.gender = gender;
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(btnId).classList.add('active');
}

function nextStep(){
    const nameInput = document.getElementById('nameInput').value.trim();
    player.name = nameInput || 'Безымянный';
    if (!player.gender) player.gender = '🧑';

    const t1 = document.getElementById('prologue1Title');
    if (t1) t1.textContent = isGirl() ? 'Ты родилась' : 'Ты родился';

    document.getElementById('createScreen').style.display = 'none';
    showScreen('prologue1');
}

/* ============================================================
   СТАРТ ЖИЗНИ · 14 ЛЕТ
   ============================================================ */
function startLife(){
    showScreen('lifeScreen');

    player.age = 14;
    player.day = 1;
    player.money = 200;
    player.alive = true;
    player.stage = 'teen';

    if (isGirl()){
        player.stats = {
            intelligence: 5,
            strength: 2,
            charisma: 5,
            health: 5,
            happiness: 4
        };
    } else {
        player.stats = {
            intelligence: 4,
            strength: 4,
            charisma: 4,
            health: 5,
            happiness: 4
        };
    }

    player.school = 4;
    player.oldSchool = 3;
    player.district = 'Низы';
    player.schoolDistrict = 'Инза';
    player.oldSchoolDistrict = 'ГАИ';

    player.mom = {
        name: 'Мама',
        job: 'повар в кафе',
        health: 8,
        mood: 7,
        relationship: 10
    };

    player.dad = {
        name: 'Отец',
        city: 'Хабаровск',
        alive: true,
        relationship: 2
    };

    // Персонажи
    player.yan = { name: 'Ян', relationship: 0, known: false };
    player.oleg = { name: 'Олег', relationship: 0, known: false };
    player.dasha = { name: 'Даша', relationship: 0, known: false };
    player.vlada = { name: 'Влада', relationship: 0, known: false };

    player.storyDay = 1;
    player.storyDone = {};
    player.openedSections = {};

    player.relationships = [];
    player.friends = 0;
    player.enemies = 0;
    player.habits = [];

    player.job = null;
    player.career = 0;
    player.bank = 0;
    player.fame = 0;

    storyFlags = {};
    dayFlags = {};

    document.body.dataset.time = 'morning';

    resetDecorLayers();

    showScene('main');
}

/* ============================================================
   ПРОДОЛЖИТЬ СОХРАНЁННУЮ ИГРУ
   ============================================================ */
function continueGame(){
    if (!loadGame()) {
        showToast('⚠️','Ошибка','Сохранение не найдено или повреждено.');
        return;
    }

    if (!player.alive){
        showToast('⚠️','Ошибка','Сохранение не содержит активной игры.');
        return;
    }

    showScreen('lifeScreen');
    updateResourceBar();

    if (!document.body.dataset.time) document.body.dataset.time = 'day';

    const targetScene = currentScene && getNode(currentScene) ? currentScene : 'main';
    showScene(targetScene);
}

/* ============================================================
   СБРОС ДЕКОРА
   ============================================================ */
function resetDecorLayers(){
    ['rainBg','discoBg','fogBg','lampsBg','fgDecor'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('active');
        if (el.dataset) el.dataset.ready = '0';
    });

    // Стоп всей музыки при сбросе
    if (typeof stopAllAudio === 'function'){
        stopAllAudio();
    }
}

/* ============================================================
   ДВИЖОК СЦЕН
   ============================================================ */
function showScene(id){
    if (!player.alive) return;

    if (id === 'stats'){ renderStatsScreen(); return; }
    if (id === 'achievements'){ renderAchievementsScreen(); return; }
    if (id === 'summary'){ renderSummaryScreen(); return; }

    const node = getNode(id);
    if (!node){
        console.warn('Нет узла:', id);
        if (id !== 'main' && getNode('main')){
            showScene('main');
        }
        return;
    }

    currentScene = id;

    const time = node.time || 'day';
    const currentTime = document.body.dataset.time || 'day';

    if (time !== currentTime){
        if (isTransitioning) return;
        isTransitioning = true;

        const overlay = document.getElementById('transitionOverlay');

        if (overlay){
            overlay.classList.add('active');

            setTimeout(() => {
                document.body.dataset.time = time;

                setTimeout(() => {
                    overlay.classList.remove('active');

                    setTimeout(() => {
                        renderSceneContent(node, id);
                        isTransitioning = false;
                    }, 300);
                }, 200);
            }, 500);
        } else {
            document.body.dataset.time = time;
            renderSceneContent(node, id);
            isTransitioning = false;
        }
    } else {
        renderSceneContent(node, id);
    }
}

/* ============================================================
   РЕНДЕР СЦЕНЫ
   ============================================================ */
function renderSceneContent(node, id){
    if (typeof node.onEnter === 'function') node.onEnter();

    updateResourceBar();

    const box = document.getElementById('sceneBox');
    if (!box) return;
    box.className = 'scene-box';

    const choices = typeof node.choices === 'function' ? node.choices() : (node.choices || []);

    let choicesHTML = '';
    choices.forEach((c, i) => {
        const cls = c.style === 'back' ? 'choice-btn back' : 'choice-btn';
        choicesHTML += `<button class="${cls}" onclick="doChoice('${id}', ${i})">${c.text}</button>`;
    });

    const titleRaw = typeof node.title === 'function' ? node.title() : (node.title || '');
    const titleHTML = titleRaw ? `<div class="scene-title">${titleRaw}</div>` : '';

    const emojiHTML = node.emoji ? `<div class="scene-emoji">${node.emoji}</div>` : '';

    const textRaw = typeof node.text === 'function' ? node.text() : (node.text || '');
    const textHTML = textRaw ? `<div class="scene-text">${textRaw}</div>` : '';

    // ДЕКОР
    let decorHTML = '';
    const isDay1 = day1ScenesBoy.includes(id) || day1ScenesGirl.includes(id);
    if (isDay1) {
        decorHTML += renderCatDecor();
    }
    if (node.decor === 'cat') {
        decorHTML += renderCatDecor();
    }
    if (node.decor === 'blood' || node.decor === 'fight') {
        decorHTML += renderBloodDecor();
    }

    const decorList = (node.decor || '').split(',').map(s => s.trim()).filter(Boolean);

    // Листья
    const fg = document.getElementById('fgDecor');
    if (fg){
        fg.classList.remove('active');
        if (isDay1){
            setTimeout(() => fg.classList.add('active'), 100);
        }
    }

    // Дождь
    const rainBg = document.getElementById('rainBg');
    if (rainBg){
        if (decorList.includes('rain')){
            if (rainBg.dataset.ready !== '1'){
                generateRaindrops();
            }
            rainBg.classList.add('active');
        } else {
            rainBg.classList.remove('active');
            rainBg.dataset.ready = '0';
        }
    }

    // Диско
    const discoBg = document.getElementById('discoBg');
    if (discoBg){
        if (decorList.includes('disco')){
            generateDiscoLights();
            setTimeout(() => discoBg.classList.add('active'), 100);
        } else {
            discoBg.classList.remove('active');
        }
    }

    // Туман
    const fogBg = document.getElementById('fogBg');
    if (fogBg){
        if (decorList.includes('fog')){
            if (fogBg.dataset.ready !== '1'){
                generateFog();
            }
            fogBg.classList.add('active');
        } else {
            fogBg.classList.remove('active');
            fogBg.dataset.ready = '0';
        }
    }

    // Фонари
    const lampsBg = document.getElementById('lampsBg');
    if (lampsBg){
        if (decorList.includes('lamps')){
            if (lampsBg.dataset.ready !== '1'){
                generateLamps();
            }
            lampsBg.classList.add('active');
        } else {
            lampsBg.classList.remove('active');
            lampsBg.dataset.ready = '0';
        }
    }

    box.innerHTML = `
        ${decorHTML}
        ${emojiHTML}
        ${titleHTML}
        ${textHTML}
        ${choicesHTML}
    `;

    box.classList.remove('fade-out');
    box.style.animation = 'none';
    void box.offsetWidth;
    box.style.animation = 'sceneIn 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.2)';
}

function doChoice(sceneId, index){
    const node = getNode(sceneId);
    if (!node) return;
    const choices = typeof node.choices === 'function' ? node.choices() : (node.choices || []);
    const choice = choices[index];
    if (!choice) return;

    if (typeof choice.action === 'function'){
        choice.action();
    } else if (choice.next){
        showScene(choice.next);
    }
}

/* ============================================================
   РЕСУРСЫ
   ============================================================ */
function updateResourceBar(){
    if (player.money < 0) player.money = 0;
    const m = document.getElementById('resMoney');
    const d = document.getElementById('resDay');
    const a = document.getElementById('resAge');
    if (m) m.textContent = (player.money || 0) + '₽';
    if (d) d.textContent = player.day || 1;
    if (a) a.textContent = player.age || 14;
}

/* ============================================================
   ТОСТ
   ============================================================ */
function showToast(emoji, title, text){
    const old = document.getElementById('toastOverlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.className = 'toast-overlay';
    overlay.id = 'toastOverlay';
    overlay.innerHTML = `
        <div class="toast">
            <div class="toast-emoji">${emoji}</div>
            <div class="toast-title">${title}</div>
            <div class="toast-text">${text}</div>
            <button class="toast-btn" onclick="closeToast()">Понятно</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function closeToast(){
    const t = document.getElementById('toastOverlay');
    if (t) t.remove();
}

/* ============================================================
   СТАТЫ / АЧИВКИ / ИТОГИ
   ============================================================ */
function renderStatsScreen(){
    const s = player.stats || {};
    const mom = player.mom || {};

    updateResourceBar();

    const rawText = `
👤 ${player.name} ${player.gender || ''}
🎂 Возраст: ${player.age}
📅 День: ${player.day}
💰 Деньги: ${player.money}₽

🧠 Интеллект: ${s.intelligence || 0}
💪 Сила: ${s.strength || 0}
😎 Харизма: ${s.charisma || 0}
❤️ Здоровье: ${s.health || 0}
😊 Счастье: ${s.happiness || 0}

👩 Мама — отношение: ${mom.relationship || 0} / 20

🤝 Ян: ${player.yan ? player.yan.relationship : 0}
🤝 Олег: ${player.oleg ? player.oleg.relationship : 0}
🤝 Даша: ${player.dasha ? player.dasha.relationship : 0}
💗 Влада: ${player.vlada ? player.vlada.relationship : 0}
    `.trim();

    const box = document.getElementById('sceneBox');
    box.innerHTML = `
        <div class="scene-emoji">📊</div>
        <div class="scene-title">Статистика</div>
        <div class="scene-text scene-text-stats">${rawText}</div>
        <button class="choice-btn back" onclick="showScene('main')">← Назад</button>
    `;
}

function renderAchievementsScreen(){
    const a = [];
    if (player.money >= 1000) a.push('💰 Первая тысяча');
    if (player.money >= 10000) a.push('💵 Десятка');
    if (player.friends >= 3) a.push('🤝 Душа компании');
    if (player.yan && player.yan.relationship >= 5) a.push('🥊 Друг Яна');
    if (player.oleg && player.oleg.relationship >= 5) a.push('💪 Друг Олега');
    if (player.dasha && player.dasha.relationship >= 5) a.push('😏 Друг Даши');

    const text = a.length ? a.join('\n') : 'Пока пусто. Живи — появятся.';

    const box = document.getElementById('sceneBox');
    box.innerHTML = `
        <div class="scene-emoji">🏆</div>
        <div class="scene-title">Достижения</div>
        <div class="scene-text scene-text-stats">${text}</div>
        <button class="choice-btn back" onclick="showScene('main')">← Назад</button>
    `;
}

function renderSummaryScreen(){
    let rawText = `👤 ${player.name}\n`;
    rawText += `🎂 Возраст: ${player.age}\n`;
    rawText += `📅 День: ${player.day}\n`;
    rawText += `💰 Денег: ${player.money}₽\n\n`;
    if (player.mom) rawText += `👩 Мама: отношение ${player.mom.relationship}/20\n`;
    if (player.dad) rawText += `👨 Отец: ${player.dad.city} (отношение ${player.dad.relationship})\n`;

    const box = document.getElementById('sceneBox');
    box.innerHTML = `
        <div class="scene-emoji">📈</div>
        <div class="scene-title">Итоги</div>
        <div class="scene-text scene-text-stats">${rawText}</div>
        <button class="choice-btn back" onclick="showScene('main')">← Назад</button>
    `;
}

/* ============================================================
   СОХРАНЕНИЕ / ЗАГРУЗКА
   ============================================================ */
function saveGame(){
    const data = { player, storyFlags, dayFlags, currentScene };
    try {
        localStorage.setItem('blag_save', JSON.stringify(data));
        showToast('💾','Сохранено','Игра сохранена.');
    } catch(e){
        showToast('⚠️','Ошибка','Не удалось сохранить.');
    }
}

function loadGame(){
    try {
        const raw = localStorage.getItem('blag_save');
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (data.player) player = data.player;
        if (data.storyFlags) storyFlags = data.storyFlags;
        if (data.dayFlags) dayFlags = data.dayFlags;
        if (data.currentScene) currentScene = data.currentScene;
        return true;
    } catch(e){
        console.warn('Не удалось загрузить сейв:', e);
        return false;
    }
}

function hasSave(){
    try {
        const raw = localStorage.getItem('blag_save');
        if (!raw) return false;
        const data = JSON.parse(raw);
        return !!(data && data.player && data.player.alive);
    } catch(e){
        return false;
    }
}

function resetGame(){
    if (!confirm('Начать заново? Прогресс потеряется.')) return;
    try { localStorage.removeItem('blag_save'); } catch(e){}
    location.reload();
}

/* ============================================================
   СТАТЫ — быстрое изменение
   ============================================================ */
function money(delta){
    if (player.money === undefined) player.money = 0;
    player.money += delta;
    if (player.money < 0) player.money = 0;
    updateResourceBar();
}

function stat(key, delta){
    if (!player.stats) player.stats = {};
    if (player.stats[key] === undefined) player.stats[key] = 0;
    player.stats[key] += delta;
    if (player.stats[key] < 0) player.stats[key] = 0;
}

function statMom(key, delta){
    if (!player.mom) player.mom = {};
    if (player.mom[key] === undefined) player.mom[key] = 0;
    player.mom[key] += delta;
}

function statYan(key, delta){
    if (!player.yan) player.yan = { name: 'Ян', relationship: 0, known: false };
    player.yan[key] = (player.yan[key] || 0) + delta;
}

function statOleg(key, delta){
    if (!player.oleg) player.oleg = { name: 'Олег', relationship: 0, known: false };
    player.oleg[key] = (player.oleg[key] || 0) + delta;
}

function statDasha(key, delta){
    if (!player.dasha) player.dasha = { name: 'Даша', relationship: 0, known: false };
    player.dasha[key] = (player.dasha[key] || 0) + delta;
}

function statVlada(key, delta){
    if (!player.vlada) player.vlada = { name: 'Влада', relationship: 0, known: false };
    player.vlada[key] = (player.vlada[key] || 0) + delta;
}

function statTeacher(key, delta){
    if (!player.teacher) player.teacher = { relationship: 0 };
    player.teacher[key] = (player.teacher[key] || 0) + delta;
}

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function chance(p){ return Math.random() < p; }

/* ============================================================
   СИСТЕМА ДНЕЙ
   ============================================================ */
function nextDay(){
    player.day++;
    player.storyDay++;
    dayFlags = {};

    if (typeof stopAllAudio === 'function'){
        stopAllAudio();
    }

    showScene('main');
}

/* ============================================================
   ПОЛУЧЕНИЕ СЦЕНЫ ТЕКУЩЕГО ДНЯ
   ============================================================ */
function getDayScene(){
    const s = player.storyDay;

    if (player.age === 14){
        if (isGirl()){
            const schedule = {
                1: { button: '📅 Первый день в новой школе', scene: 'g_day1_start' }
            };
            return schedule[s] || null;
        } else {
            const schedule = {
                1: { button: '📅 Первый день в новой школе', scene: 'b_day1_start' }
            };
            return schedule[s] || null;
        }
    }

    return null;
}