// import { type NextRequest, NextResponse } from "next/server"
// import { getCategoryById } from "@/lib/product-api"

// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const category = await getCategoryById(params.id)

//     if (!category) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Category not found",
//         },
//         { status: 404 },
//       )
//     }

//     return NextResponse.json({
//       success: true,
//       data: category,
//     })
//   } catch (error) {
//     console.error("Error in category API:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch category",
//       },
//       { status: 500 },
//     )
//   }
// }
