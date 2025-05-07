import Link from "next/link"
import { Mail } from "lucide-react"

export function ContactUs() {
  return (
    <div className="p-2">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Faculty Mentor</h3>
          <p className="text-sm">Dr. S. Padmini</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Students Team</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="mailto:de1462@srmist.edu.in" className="hover:underline text-primary">
                E. Dhanush (RA2311003010520)
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                Email: de1462@srmist.edu.in
                <br />
                Mobile: +919059446435
              </p>
            </li>
            <li>
              <Link href="mailto:pm4845@srmist.edu.in" className="hover:underline text-primary">
                P. Mohit (RA2311003010522)
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                Email: pm4845@srmist.edu.in
                <br />
                Mobile: +917075015760
              </p>
            </li>
            <li>
              <Link href="mailto:ad6385@srmist.edu.in" className="hover:underline text-primary">
                D. Akash Reddy (RA2311003010530)
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                Email: ad6385@srmist.edu.in
                <br />
                Mobile: +919440247744
              </p>
            </li>
          </ul>
        </div>

        <div className="pt-2">
          <Link
            href="mailto:contact@srmlostfound.com"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <Mail className="mr-2 h-4 w-4" />
            Email us
          </Link>
        </div>
      </div>
    </div>
  )
}
