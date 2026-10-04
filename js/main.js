'use strict';

/* ============================================================
   СБОРКА STORY NODES
   ВАЖНО: storyNodes объявлен в engine.js через var,
   здесь мы его НАПОЛНЯЕМ, а не переопределяем (иначе TDZ).
   ============================================================ */

if (typeof act1Nodes === 'undefined'){
    console.error('act1Nodes не определён. Проверь story-act1.js');
}
if (typeof act2Nodes === 'undefined'){
    console.error('act2Nodes не определён. Проверь story-act2.js');
}

Object.assign(
    storyNodes,
    typeof act1Nodes !== 'undefined' ? act1Nodes : {},
    typeof act2Nodes !== 'undefined' ? act2Nodes : {}
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

    // Только для новых версий
    if (version >= 6.1){
        try { tg.disableVerticalSwipes(); } catch(e){}
        try { tg.setHeaderColor('#f5ecd9'); } catch(e){}
        try { tg.setBackgroundColor('#f5ecd9'); } catch(e){}
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
   Проверяем, что функции из decor.js реально загрузились
   ============================================================ */
if (typeof generateStars === 'function') generateStars();
if (typeof generateFgDecor === 'function') generateFgDecor();
if (typeof generateBgDots === 'function') generateBgDots();

/* ============================================================
   ВОССТАНОВЛЕНИЕ ИГРЫ
   Автозагрузку НЕ делаем — иначе конфликт с continueGame().
   Если игрок нажмёт «Продолжить» — continueGame() сам вызовет loadGame().
   Если «Начать» — startLife() создаст нового игрока.
   ============================================================ */
// (пусто — вся логика в engine.js: hasSave(), loadGame(), continueGame())
