export class TitleHelper {
  static addTitlePart(part: string, title: string = document.title): string {
    if (!title)
      return part;
    else if (part) {
      const _title = title;
      title = `${part} | ${_title}`;
    }
    return title;
  }
}