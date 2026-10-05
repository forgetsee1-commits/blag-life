/* ============================================================
   ОБЩИЕ УЗЛЫ — main, act_select, referral, day_empty
   ============================================================ */

const commonNodes = {

main: {
    emoji: '🌆',
    time: 'day',
    title: () => 'Возраст: ' + player.age + ' · День ' + player.day,
    text: () => 'Что будешь делать?',
    choices: () => {
        const list = [];

        const dayScene = getDayScene();
        if (dayScene){
            list.push({ text: dayScene.button, next: dayScene.scene });
        } else {
            list.push({ text: '📅 Прожить день', next: 'day_empty' });
        }

        return list;
    }
},

day_empty: {
    emoji: '🌅',
    time: 'day',
    title: 'День прошёл',
    text: 'Ты просто прожил этот день. Ничего особенного.',
    choices: [
        { text: 'Дальше', action: () => { nextDay(); } }
    ]
},

act_select: {
    emoji: '📖',
    time: 'day',
    title: 'Выбор акта',
    text: 'Скоро.',
    choices: [
        { text: '↩️ Назад', next: 'main', style: 'back' }
    ]
},

referral: {
    emoji: '🔗',
    time: 'day',
    title: 'Пригласить друга',
    text: () => {
        const refs = player.referrals || 0;
        return `Ты пригласил: ${refs} друзей.\n\n(Скоро тут будет секретная сюжетная линия)`;
    },
    choices: [
        { text: '↩️ Назад', next: 'main', style: 'back' }
    ]
}

}; // конец commonNodes