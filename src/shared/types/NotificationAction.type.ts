import { type JSX } from 'react';

export type ButtonVariant = 'contained' | 'outlined' | 'dashed' | 'text' | 'transparent';
export type ButtonColor = 'primary' | 'secondary' | 'danger';

export type NotificationActionOnClick = {
  label: string;
  onClick: () => void | Promise<void>;
};

export type NotificationAction = {
  label: string;
  color?: ButtonColor;
  variant?: ButtonVariant;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
};

export type PropsWithRenderButton<T = unknown> = T & {
  renderButton: (props: NotificationAction) => JSX.Element;
};

export type NotificationActionWrapper = {
  actionButtonWrapper: (props: PropsWithRenderButton) => JSX.Element;
};

export type NotificationActionClickOrWrapper = NotificationActionOnClick | NotificationActionWrapper;

export const hasOnClick = (action: NotificationActionClickOrWrapper | undefined): action is NotificationActionOnClick =>
  action !== undefined && 'onClick' in action;

export const hasWrapper = (action: NotificationActionClickOrWrapper | undefined): action is NotificationActionWrapper =>
  action !== undefined && 'actionButtonWrapper' in action;
