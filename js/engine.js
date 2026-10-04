'use strict';

/* ============================================================
   ИГРОВОЕ СОСТОЯНИЕ
   ============================================================ */
let player = {};
let storyFlags = {};
let dayFlags = {};
let currentScene = null;

/* Флаг перехода между сценами — защита от гонок таймеров */
let isTransitioning = false;

/* storyNodes наполняется в main.js — объявляем здесь,
   чтобы не было TDZ при обращении из showScene.
   Именно var — чтобы typeof вернул 'undefined', а не упал. */
var storyNodes = {};

/* ============================================================
   СПИСКИ СЦЕН ДЛЯ ДЕКОРА
   ============================================================ */
const day1Scenes = [
    'day1_start','day1_breakfast','day1_skip_breakfast','day1_walk',
    'day1_lineup','day1_meet_yanchik','day1_ignore_yanchik','day1_class',
    'day1_speak_confident','day1_speak_shy','day1_speak_joke','day1_break',
    'day1_vlad_angry','day1_vlad_silent','day1_vlad_joke',
    'day1_after_school','day1_walk_home','day1_home','day1_tv','day1_sleep'
];

const day2Scenes = [
    'day2_start','day2_umbrella','day2_no_umbrella','day2_school','day2_answer',
    'day2_silent','day2_break','day2_agree_vlad','day2_decline_vlad','day2_ask_vlad',
    'day2_after_school','day2_milk','day2_milk_ask','day2_milk_leave',
    'day2_park_kiselev','day2_park_ask','day2_park_know','day2_end','day2_home',
    'day2_mom_talk','day2_silent_promise','day2_mom_short','day2_sleep'
];

const day3Scenes = [
    'day3_start','day3_study','day3_walk','day3_school','day3_solve_self',
    'day3_solve_cheat','day3_confess','day3_break','day3_agree_disco',
    'day3_decline_disco','day3_ask_disco','day3_disco_go','day3_disco_mix',
    'day3_disco_watch','day3_disco_shy','day3_disco_scene','day3_disco_end','day3_home'
];

/* Быстрый поиск по сетам — вместо includes() на массивах */
const day1Set = new Set(day1Scenes);
const day2Set = new Set(day2Scenes);
const day3Set = new Set(day3Scenes);

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
   ХЕЛПЕРЫ ПОЛА
   ============================================================ */
function isGirl() { return player.gender === '👧'; }
function g(male, female) { return isGirl() ? female : male; }

function randomGirlName() {
    const names = ['Катя', 'Ксюша', 'Лера', 'Алина'];
    return names[Math.floor(Math.random() * names.length)];
}

function genderScene(maleScene, femaleScene){
    return isGirl() ? femaleScene : maleScene;
}

function genderText(maleText, femaleText){
    return isGirl() ? femaleText : maleText;
}

function genderFlag(name, maleValue, femaleValue){
    dayFlags[name] = isGirl() ? femaleValue : maleValue;
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
   СТАРТ ЖИЗНИ
   ============================================================ */
function startLife(){
    showScreen('lifeScreen');

    player.age = 10;
    player.day = 1;
    player.money = 0;
    player.alive = true;
    player.stage = 'child';

    player.stats = {
        intelligence: 4,
        strength: isGirl() ? 3 : 4,
        charisma: isGirl() ? 5 : 4,
        health: 5,
        happiness: 4
    };

    player.school = 3;
    player.oldSchool = 2;
    player.oldSchoolFriends = [];

    player.mom = { name: 'Мама', health: 7, mood: 6, relationship: 10 };
    player.enemy = { name: 'Влад', strength: 6, charisma: 7, relationship: -3 };

    player.mentor = null;
    player.brother = null;

    if (isGirl()) {
        const boyNames = ['Дима', 'Макс', 'Артём', 'Кирилл'];
        player.loveInterest = boyNames[Math.floor(Math.random() * boyNames.length)];
    } else {
        player.loveInterest = randomGirlName();
    }

    player.storyDay = 1;
    player.storyDone = {};
    player.openedSections = {};

    player.relationships = [];
    player.friends = 0;
    player.enemies = 0;
    player.habits = [];

    player.job = null;
    player.career = 0;
    player.bizLevel = 0;
    player.bizIncome = 0;
    player.bank = 0;
    player.kids = 0;
    player.fame = 0;
    player.house = false;
    player.car = null;

    // Сброс сюжетных флагов при новой игре
    storyFlags = {};
    dayFlags = {};

    // Время по умолчанию
    document.body.dataset.time = 'day';

    // Сброс декоративных слоёв на всякий случай
    resetDecorLayers();

    // Запускаем сцену главного меню
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

    // Проверяем, что критичные поля на месте
    if (!player.alive){
        showToast('⚠️','Ошибка','Сохранение не содержит активной игры.');
        return;
    }

    showScreen('lifeScreen');
    updateResourceBar();

    // Восстанавливаем время суток
    if (!document.body.dataset.time) document.body.dataset.time = 'day';

    // Возвращаемся в текущую сцену или main
    const targetScene = currentScene && storyNodes[currentScene] ? currentScene : 'main';
    showScene(targetScene);
}

/* ============================================================
   СБРОС ДЕКОРА (для нового старта / смены акта)
   ============================================================ */
function resetDecorLayers(){
    ['rainBg','discoBg','fogBg','lampsBg','fgDecor'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('active');
        if (el.dataset) el.dataset.ready = '0';
    });
}

/* ============================================================
   АВТОЗАМЕНА РОДА — РАСШИРЕННЫЙ СЛОВАРЬ
   ============================================================ */
const GENDER_DICT = [
    // === ОБРАЩЕНИЯ ===
    ['малой', 'малая'],
    ['Малой', 'Малая'],
    ['малому', 'малой'],
    ['малым', 'малой'],
    ['малыш', 'малышка'],
    ['сынок', 'дочка'],
    ['сын', 'дочь'],
    ['сына', 'дочь'],
    ['сыну', 'дочери'],
    ['сыном', 'дочерью'],
    ['братан', 'сестрёнка'],
    ['брат', 'сестра'],
    ['друг', 'подруга'],
    ['друзья', 'подруги'],
    ['друга', 'подругу'],
    ['пацан', 'девчонка'],
    ['пацаны', 'девчонки'],
    ['мужик', 'баба'],
    ['мужики', 'бабы'],

    // === ПРИЛАГАТЕЛЬНЫЕ ===
    ['сам', 'сама'],
    ['самый', 'самая'],
    ['самого', 'самой'],
    ['самому', 'самой'],
    ['один', 'одна'],
    ['одного', 'одной'],
    ['одному', 'одной'],
    ['готов', 'готова'],
    ['рад', 'рада'],
    ['должен', 'должна'],
    ['виноват', 'виновата'],
    ['уверен', 'уверена'],
    ['согласен', 'согласна'],
    ['лучший', 'лучшая'],
    ['взрослый', 'взрослая'],
    ['маленький', 'маленькая'],
    ['смелый', 'смелая'],
    ['сильный', 'сильная'],
    ['умный', 'умная'],
    ['слабый', 'слабая'],
    ['свой', 'своя'],
    ['чужой', 'чужая'],
    ['новый', 'новая'],
    ['новенький', 'новенькая'],
    ['добрый', 'добрая'],
    ['злой', 'злая'],
    ['весёлый', 'весёлая'],
    ['грустный', 'грустная'],
    ['усталый', 'усталая'],
    ['красивый', 'красивая'],
    ['страшный', 'страшная'],
    ['глупый', 'глупая'],
    ['первый', 'первая'],
    ['последний', 'последняя'],

    // === ГЛАГОЛЫ ===
    ['понял', 'поняла'],
    ['забыл', 'забыла'],
    ['пошёл', 'пошла'],
    ['ушёл', 'ушла'],
    ['пришёл', 'пришла'],
    ['нашёл', 'нашла'],
    ['сделал', 'сделала'],
    ['сказал', 'сказала'],
    ['увидел', 'увидела'],
    ['услышал', 'услышала'],
    ['смотрел', 'смотрела'],
    ['думал', 'думала'],
    ['знал', 'знала'],
    ['хотел', 'хотела'],
    ['мог', 'могла'],
    ['смог', 'смогла'],
    ['стал', 'стала'],
    ['взял', 'взяла'],
    ['дал', 'дала'],
    ['жил', 'жила'],
    ['был', 'была'],
    ['попал', 'попала'],
    ['попутал', 'попутала'],
    ['обосрался', 'обосралась'],
    ['добрался', 'добралась'],
    ['вернулся', 'вернулась'],
    ['справился', 'справилась'],
    ['удивился', 'удивилась'],
    ['обрадовался', 'обрадовалась'],
    ['испугался', 'испугалась'],
    ['рассмеялся', 'рассмеялась'],
    ['улыбнулся', 'улыбнулась'],
    ['задумался', 'задумалась'],
    ['согласился', 'согласилась'],
    ['отказался', 'отказалась'],
    ['сдался', 'сдалась'],
    ['остался', 'осталась'],

    // === ОЦЕНКИ / ХАРАКТЕР ===
    ['молодец', 'умница'],
    ['красавчик', 'красотка'],
    ['красава', 'красотка'],
    ['дурак', 'дура'],
    ['лох', 'лохушка'],
    ['трус', 'трусиха']
];

/* Предсортированный словарь — считаем один раз */
const GENDER_DICT_SORTED = [...GENDER_DICT].sort((a, b) => b[0].length - a[0].length);

/* Регекс для проверки границ */
const LETTER_RE = /[а-яА-ЯёЁa-zA-Z]/;

/* ============================================================
   GENDERFIX — УМНАЯ АВТОЗАМЕНА
   ============================================================ */
function genderFix(text){
    if (!text || typeof text !== 'string') return text;
    if (!isGirl()) return text;

    let result = text;

    for (const [male, female] of GENDER_DICT_SORTED){
        let pos = 0;
        let out = '';
        while (pos < result.length){
            const idx = result.indexOf(male, pos);
            if (idx === -1){
                out += result.slice(pos);
                break;
            }
            const before = idx > 0 ? result[idx - 1] : '';
            const after = idx + male.length < result.length ? result[idx + male.length] : '';
            const isLetterBefore = LETTER_RE.test(before);
            const isLetterAfter = LETTER_RE.test(after);

            if (!isLetterBefore && !isLetterAfter){
                out += result.slice(pos, idx) + female;
                pos = idx + male.length;
            } else {
                out += result.slice(pos, idx + male.length);
                pos = idx + male.length;
            }
        }
        result = out;
    }

    return result;
}

/* ============================================================
   ДВИЖОК СЦЕН
   ============================================================ */
function showScene(id){
    if (!player.alive) return;

    // Служебные экраны
    if (id === 'stats'){ renderStatsScreen(); return; }
    if (id === 'achievements'){ renderAchievementsScreen(); return; }
    if (id === 'summary'){ renderSummaryScreen(); return; }

    // Защита от бесконечной рекурсии
    if (typeof storyNodes === 'undefined' || !storyNodes){
        console.error('storyNodes не определён. Проверь порядок загрузки скриптов.');
        return;
    }

    // Гендерная развилка сцены
    if (storyNodes[id] && storyNodes[id].sceneGender){
        const variants = storyNodes[id].sceneGender;
        const chosen = isGirl() ? variants.female : variants.male;
        if (chosen && storyNodes[chosen]){
            id = chosen;
        }
    }

    const node = storyNodes[id];
    if (!node){
        console.warn('Нет узла:', id);
        if (id !== 'main' && storyNodes['main']){
            showScene('main');
        }
        return;
    }

    currentScene = id;

    // ===== ВРЕМЯ СУТОК =====
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
   РЕНДЕР СОДЕРЖИМОГО СЦЕНЫ
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
        const choiceText = genderFix(c.text);
        choicesHTML += `<button class="${cls}" onclick="doChoice('${id}', ${i})">${choiceText}</button>`;
    });

    const titleRaw = typeof node.title === 'function' ? node.title() : (node.title || '');
    const titleText = genderFix(titleRaw);
    const titleHTML = titleText ? `<div class="scene-title">${titleText}</div>` : '';

    const emojiHTML = node.emoji ? `<div class="scene-emoji">${node.emoji}</div>` : '';

    const textRaw = typeof node.text === 'function' ? node.text() : (node.text || '');
    const text = genderFix(textRaw);
    const textHTML = text ? `<div class="scene-text">${text}</div>` : '';

    // ДЕКОР СЦЕНЫ
    let decorHTML = '';
    if (day1Set.has(id)) {
        decorHTML += renderCatDecor();
    }
    if (node.decor === 'cat') {
        decorHTML += renderCatDecor();
    }
    if (node.decor === 'blood' || node.decor === 'fight') {
        decorHTML += renderBloodDecor();
    }

    // Разбираем node.decor один раз
    const decorList = (node.decor || '').split(',').map(s => s.trim()).filter(Boolean);

    // Фоновый декор: листья
    const fg = document.getElementById('fgDecor');
    if (fg){
        fg.classList.remove('active');
        if (day1Set.has(id) || day2Set.has(id) || day3Set.has(id)){
            setTimeout(() => fg.classList.add('active'), 100);
        }
    }

    // ДОЖДЬ
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

    // ДИСКОТЕКА
    const discoBg = document.getElementById('discoBg');
    if (discoBg){
        if (decorList.includes('disco')){
            generateDiscoLights();
            setTimeout(() => discoBg.classList.add('active'), 100);
        } else {
            discoBg.classList.remove('active');
        }
    }

    // ТУМАН
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

    // ФОНАРИ
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

    // Плавное появление
    box.classList.remove('fade-out');
    box.style.animation = 'none';
    void box.offsetWidth;
    box.style.animation = 'sceneIn 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.2)';
}

function doChoice(sceneId, index){
    const node = storyNodes[sceneId];
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
    if (a) a.textContent = player.age || 10;
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
            <div class="toast-title">${genderFix(title)}</div>
            <div class="toast-text">${genderFix(text)}</div>
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
   ВАЖНО: имя игрока НЕ проходит через genderFix
   ============================================================ */
function renderStatsScreen(){
    const s = player.stats || {};
    const mom = player.mom || {};
    const enemy = player.enemy || {};

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
👿 Влад — вражда: ${Math.abs(enemy.relationship || 0)} / 20
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
    if (player.money >= 100000) a.push('💎 Богач');
    if (player.friends >= 5) a.push('🤝 Душа компании');
    if (player.storyDone && Object.keys(player.storyDone).length >= 3) a.push('📖 Первые главы');

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
    if (player.mentor) rawText += `🎓 Наставник: ${player.mentor.name}\n`;
    if (player.brother) rawText += `🧑 Брат: ${player.brother.name}\n`;

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
        // Проверяем, что это валидный JSON с player
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

function statTeacher(key, delta){
    if (!player.teacher) player.teacher = { relationship: 0 };
    player.teacher[key] = (player.teacher[key] || 0) + delta;
}

function statYan(key, delta){
    if (!player.yanchik) player.yanchik = { relationship: 5 };
    player.yanchik[key] = (player.yanchik[key] || 0) + delta;
}

function statAlena(key, delta){
    if (!player.alena) player.alena = { relationship: 0 };
    player.alena[key] = (player.alena[key] || 0) + delta;
}

function statSeva(key, delta){
    if (!player.seva) player.seva = { relationship: 0 };
    player.seva[key] = (player.seva[key] || 0) + delta;
}

function statMaxim(key, delta){
    if (!player.maxim) player.maxim = { relationship: 0 };
    player.maxim[key] = (player.maxim[key] || 0) + delta;
}

function statEnemy(key, delta){
    if (!player.enemy) player.enemy = {};
    if (player.enemy[key] === undefined) player.enemy[key] = 0;
    player.enemy[key] += delta;
}

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function chance(p){ return Math.random() < p; }

/* ============================================================
   СИСТЕМА ДНЕЙ
   storyFlags НЕ сбрасываются между днями — только dayFlags
   ============================================================ */
function nextDay(){
    player.day++;
    player.storyDay++;
    dayFlags = {};
    showScene('main');
}

function nextAct(){
    player.age = 11;
    player.day = 1;
    player.storyDay = 1;
    dayFlags = {};
    storyFlags = {};
    resetDecorLayers();
    showScene('act_transition');
}

function startAct(actNumber){
    if (actNumber === 1){
        player.age = 10;
        player.day = 1;
        player.storyDay = 1;
        dayFlags = {};
        storyFlags = {};
        resetDecorLayers();
        showToast('📖','Акт 1','Начинаем с 10 лет.');
        setTimeout(() => showScene('main'), 1500);
        return;
    }
    if (actNumber === 2){
        player.age = 11;
        player.day = 1;
        player.storyDay = 1;
        dayFlags = {};
        storyFlags = {};
        resetDecorLayers();
        showToast('📖','Акт 2','Начинаем с 11 лет.');
        setTimeout(() => showScene('main'), 1500);
        return;
    }
}


/* ============================================================
   ПОЛУЧЕНИЕ СЦЕНЫ ТЕКУЩЕГО ДНЯ
   ============================================================ */
function getDayScene(){
    const s = player.storyDay;

    if (player.age === 10){
        const schedule = {
            1: { button: '📅 Первый день в школе', scene: 'day1_start' },
            2: { button: '📅 Второй день в школе', scene: 'day2_start' },
            3: { button: '📅 Третий день в школе', scene: 'day3_start' },
            4: { button: '📅 Суббота — мама болеет', scene: 'day4_start' },
            5: { button: '📅 Воскресенье — Резинка', scene: 'day5_start' },
            6: { button: '📅 Понедельник — новости', scene: 'day6_start' },
            7: { button: '📅 Вторник — поручение', scene: 'day7_start' }
        };
        return schedule[s] || null;
    }

    if (player.age === 11){
        const schedule = {
            1: { button: '📅 Первый день · 5 класс', scene: 'a2_day1_start' },
            2: { button: '📅 Второй день · слухи', scene: 'a2_day2_start' },
            3: { button: '📅 Третий день · классная', scene: 'a2_day3_start' },
            4: { button: '📅 Четвёртый день · Резинка', scene: 'a2_day4_start' },
            5: { button: '📅 Пятый день · Максим', scene: 'a2_day5_start' },
            6: { button: '📅 Шестой день · стычка', scene: 'a2_day6_start' },
            7: { button: '📅 Седьмой день · развязка', scene: 'a2_day7_start' }
        };
        return schedule[s] || null;
    }

    return null;
}
