/* ============================================================
   СБОРКА STORY NODES
   ============================================================ */
const storyNodes = {
    ...act1Nodes,
    ...act2Nodes
};

/* ============================================================
   TELEGRAM MINI APP
   ============================================================ */
(function initTelegram(){
    if (window.Telegram && window.Telegram.WebApp){
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
        console.log('Mini App запущен в Telegram (v' + version + ')');
    } else {
        console.log('Игра запущена вне Telegram');
    }
})();

/* ============================================================
   ДЕКОР ФОНА — запуск
   ============================================================ */
generateStars();
generateFgDecor();
generateBgDots();

/* ============================================================
   ВОССТАНОВЛЕНИЕ ИГРЫ (если есть сохранение)
   ============================================================ */
(function tryRestore(){
    try {
        const saved = localStorage.getItem('blag_save');
        if (!saved) return;

        const data = JSON.parse(saved);
        if (!data || !data.player) return;

        // Автовосстановление только если игрок уже создан
        // и жив (прошёл прологи)
        if (data.player.name && data.player.age){
            player = data.player;
            storyFlags = data.storyFlags || {};
            dayFlags = data.dayFlags || {};

            // Не восстанавливаем экран — ждём действий пользователя
            // Просто данные в памяти
            console.log('Сохранение найдено, но не загружено автоматически');
        }
    } catch(e){
        console.warn('Не удалось прочитать сохранение:', e);
    }
})();