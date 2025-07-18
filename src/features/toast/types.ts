
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export type Toast = Omit<ToasterToast, "id">;

export interface State {
  toasts: ToasterToast[];
}
