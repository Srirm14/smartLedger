import { RegisterForm } from "../register-form";
import logo from "../../../assets/logo/SmartLedgerColoured.svg";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="min-h-svh bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="w-fit max-w-md">
          <Card className="overflow-hidden w-full rounded-3xl shadow-xl">
            <CardContent className="p-0">
              <div className="flex flex-col p-6 md:p-8">
                <div className="flex justify-center mb-6">
                  <div className="relative overflow-hidden">
                    <img src={logo} alt="Smart Ledger" className="h-8 relative z-10" />
                    <div className="absolute inset-0 z-20 animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-full">
                    <RegisterForm />
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