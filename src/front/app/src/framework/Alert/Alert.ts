type alertType = 'success' | 'info' | 'warning' | 'error' | 'close';

export default class Alert {
  private static container = document.getElementById('alert-container');
  private static icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"> \
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> \
              </svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
             <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
           </svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>`
  };

  private static createAlertIcon(icon: string) {
    const newIcon = document.createElement('div');

    newIcon.innerHTML = icon;

    return newIcon;
  }

  private static createAlertDiv(classes: string[], content: string = '') {
    const newDiv = document.createElement('div');

    newDiv.classList.add(...classes);
    newDiv.innerHTML = content;

    return newDiv;
  }

  private static createAlertMessage(title: string, message?: string) {
    const newMessageContainer = document.createElement('div');
    const newTitleContainer = Alert.createAlertDiv(['alert-title-container'], title);
    const newMessage = Alert.createAlertDiv(['alert-message'], message);

    newMessageContainer.classList.add('alert-message-container');
    newMessageContainer.appendChild(newTitleContainer);
    if (message)
      newMessageContainer.appendChild(newMessage);

    return newMessageContainer;
  }

  private static addAlertAnimation(alert: HTMLElement) {
    const anim = alert.animate([
      { transform: 'translateX(50rem)', opacity: 0, offset: 0 },
      { transform: 'translateX(0rem)', offset: 0.1 },
      { opacity: 1, offset: 0.2 },
      { transform: 'translateX(0rem)', opacity: 1, offset: 0.95 },
      { transform: 'translateX(50rem)', opacity: 0, offset: 1 },
    ], {
      duration: 10000,
      fill: 'forwards'
    });

    anim.onfinish = () => alert.remove();

    return anim;
  }

  private static skipAnimation(alertAnimation: Animation) {
    const timing = alertAnimation.effect?.getTiming();

    if (typeof alertAnimation.currentTime === "number" && 
        timing && typeof timing.duration === "number") {

      if (alertAnimation.currentTime < timing.duration * 0.95) {
        alertAnimation.currentTime = timing.duration * 0.95;
      }
    }
  }

  private static createAlert(type: alertType, title: string, message?: string) {
    const newAlert = document.createElement('article');
    const alertWrapper = document.createElement('div');
    const icon = Alert.icons[type];
    const closeIcon = Alert.icons.close;
    const alertAnimation = Alert.addAlertAnimation(newAlert);
    const iconDiv = Alert.createAlertIcon(icon);
    const closeButtonDiv = Alert.createAlertIcon(closeIcon);
    const messageContainer = Alert.createAlertMessage(title, message);

    alertWrapper.appendChild(iconDiv);
    alertWrapper.appendChild(messageContainer);
    alertWrapper.appendChild(closeButtonDiv);
    alertWrapper.classList.add('alert-wrapper', type);

    closeButtonDiv.classList.add('closeAlertButton');
    closeButtonDiv.addEventListener('click', () => Alert.skipAnimation(alertAnimation));

    newAlert.classList.add('alert');
    newAlert.appendChild(alertWrapper);

    Alert.container?.prepend(newAlert);
  }

  public static success(title: string, message?: string) {
    Alert.createAlert('success', title, message);
  }

  public static info(title: string, message?: string) {
    Alert.createAlert('info', title, message);
  }

  public static warning(title: string, message?: string) {
    Alert.createAlert('warning', title, message);
  }

  public static error(title: string, message?: string) {
    Alert.createAlert('error', title, message);
  }
}
