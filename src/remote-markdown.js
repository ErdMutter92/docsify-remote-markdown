export function getFile(target) {
  return Promise
    .resolve()
    .then(() => fetch(target))
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP error, status = ' + response.status);
      }
      return response.text();
    })
}

export function install(hook, vm) {
  const config = Object.assign({}, {
    tag: 'remoteMarkdownUrl',
  }, vm.config.remoteMarkdown);

  hook.beforeEach(function (content, next) {
    const reg = new RegExp(`\\[${config.tag}\\]\\((http://.+|https://.+)\\)`, "g");
    const tags = content.match(reg);

    if (tags && tags.length > 0) {
      Promise.all(
        tags.map((tag) => fetch(tag.slice(tag.indexOf("(")+1,tag.indexOf(")"))).then((resp) => resp.text()))
      ).then((texts) => {
        texts.forEach((data, idx) => {
          content = content.replace(tags[idx], `\n ${data} \n`);
        });
        next(content);
      });
    } else {
      next(content);
    }
  });
}
