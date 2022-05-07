import { contentClient } from '../chrome/message';

contentClient.listen('refresh page', (res, sendResponse) => {
    sendResponse('received refresh cmd');
    setTimeout(() => {
        window.location.reload();
    }, 500);
});
