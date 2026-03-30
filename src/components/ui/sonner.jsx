import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    (<Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-neutral-white group-[.toaster]:text-neutral-gray900 group-[.toaster]:border-neutral-gray200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-neutral-gray900 dark:group-[.toaster]:text-neutral-gray100 dark:group-[.toaster]:border-neutral-gray700",
          description: "group-[.toast]:text-neutral-gray500 dark:group-[.toast]:text-neutral-gray400",
          actionButton:
            "group-[.toast]:bg-neutral-gray900 group-[.toast]:text-neutral-white dark:group-[.toast]:bg-neutral-gray100 dark:group-[.toast]:text-neutral-gray900",
          cancelButton:
            "group-[.toast]:bg-neutral-gray100 group-[.toast]:text-neutral-gray500 dark:group-[.toast]:bg-neutral-gray800 dark:group-[.toast]:text-neutral-gray400",
        },
      }}
      {...props} />)
  );
}

export { Toaster }
