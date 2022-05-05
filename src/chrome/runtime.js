/* eslint-disable no-undef */
function reload() {
    // 调用 chrome 的 reload 接口完成插件的更新
    chrome.runtime.reload();
}

export { reload };
