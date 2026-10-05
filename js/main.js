'use strict';

/* ============================================================
   СБОРКА STORY NODES
   ============================================================ */
if (typeof act1BoyNodes === 'undefined'){
    console.error('act1BoyNodes не определён. Проверь story-act1-boy.js');
}
if (typeof act1GirlNodes === 'undefined'){
    console.error('act1GirlNodes не определён. Проверь story-act1-girl.js');
}
if (typeof commonNodes === 'undefined'){
    console.error('commonNodes не определён.');
}

// Общие узлы (main, act_select, stats и т.д.)
Object.assign(
    storyNodesCommon,
    typeof commonNodes !== 'undefined' ? commonNodes : {}
);

// Линия мальчика
Object.assign(
    storyNodesBoy,
    typeof act1BoyNodes !== 'undefined' ? act1BoyNodes : {}
);

// Линия девочки
Object.assign(
    storyNodesGirl,
    typeof act1GirlNodes !== 'undefined' ? act1GirlNodes : {}
);

/* ============================================================
   TELEGRAM MINI APP
   ============================================================ */
(function initTelegram(){
    if (!window.Telegram || !window.Telegram.WebApp){
        return;
    }

    const tg = window.Telegram.WebApp;
    const version = parseFloat(tg.version) || 0;

    try { tg.ready(); } catch(e){}
    try { tg.expand(); } catch(e){}

    if (version >= 6.1){
    try { tg.setHeaderColor('#f5ecd9'); } catch(e){}
    try { tg.setBackgroundColor('#f5ecd9'); } catch(e){}
}

// Разрешаем вертикальные свайпы — иначе скролл в мини-аппе не работает
if (version >= 7.0){
    try { tg.enableVerticalSwipes(); } catch(e){}
}

    if (tg.initDataUnsafe && tg.initDataUnsafe.user){
        const user = tg.initDataUnsafe.user;
        const nameField = document.getElementById('nameInput');
        if (nameField && !nameField.value){
            nameField.value = user.first_name || user.username || '';
        }
    }
})();

/* ============================================================
   ДЕКОР ФОНА — запуск
   ============================================================ */
if (typeof generateStars === 'function') generateStars();
if (typeof generateFgDecor === 'function') generateFgDecor();
if (typeof generateBgDots === 'function') generateBgDots();
