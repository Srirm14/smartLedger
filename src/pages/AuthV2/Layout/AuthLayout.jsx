import logo from "../../../assets/logo/SmartLedgerColoured.svg";
import authAbstract from "../../../assets/illustrations/authAbstract.svg";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-svh bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-sm md:max-w-4xl">
          <Card className="overflow-hidden w-full rounded-3xl shadow-xl h-[500px]">
            <CardContent className="grid p-0 md:grid-cols-2 h-full">
              <div className="relative hidden md:block overflow-hidden">
                <img src={authAbstract} alt="Smart Ledger" className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale relative z-10" />
                <div className="absolute inset-0 z-20 animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
              <div className="flex flex-col p-6 md:p-8 h-full">
                <div className="flex justify-center md:justify-start mb-1">
                  <div className="relative overflow-hidden">
                    <img src={logo} alt="Smart Ledger" className="h-8 relative z-10" />
                    <div className="absolute inset-0 z-20 animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-y-auto">
                  <div className="w-full max-w-xs">
                    {children}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 