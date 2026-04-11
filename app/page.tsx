import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (token) {
    redirect("/dashboard");
  } else {
    redirect("/signin");
  }
}

// export default function HomePage() {
//   return (
//     <div>
//       {/* <LandingNavbar />
//       <main className="flex flex-col items-center justify-center min-h-screen">
//         <h1 className="text-3xl font-bold">Welcome to the Platform</h1>
//         <p className="mt-2 text-gray-600">
//           This is the landing page. Sign in to continue.
//         </p>
//       </main> */}
//       <div className="min-h-screen flex items-center justify-center">
//         Home page
//       </div>
//     </div>
//   );
// }



// import HomeNavbar from "@/common/HomeNavbar";
// import HeroSection from "@/components/home/HeroSection";

// export default function Home() {
//   return (
//     <div>
//       <HomeNavbar />
//       <HeroSection/>
//     </div>
//   );
// }


// import LandingNavbar from "@/components/layout/LandingNavbar";
