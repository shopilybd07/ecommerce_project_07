import SearchPage from "@/components/Search"
import { Suspense } from "react"

const page = () => {
  return (
    <div className="">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchPage />
      </Suspense>
    </div>
  )
}
export default page