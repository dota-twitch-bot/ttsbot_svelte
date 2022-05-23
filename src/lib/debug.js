import log from 'loglevel';

log.enableAll();

export function debug(message) {
    let date = new Date;
    let timestamp = "[" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds() + "]";
    log.debug("%c" + timestamp + " %c" + message, "color:orange;", "color: default;");
}