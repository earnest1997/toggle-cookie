import { contentClient } from '../chrome/message';

contentClient.listen('refresh page', (res, sendResponse) => {
    sendResponse('received refresh cmd');
    setTimeout(() => {
        console.log(90909999908888);
        window.location.reload();
    }, 500);
});
