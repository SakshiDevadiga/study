import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-primary text-xl font-bold">StudyMate</h2>
            <p className="text-gray-500 text-sm mt-1">Collaborative Study Platform</p>
          </div>
          
          <div className="flex space-x-6">
            <Link href="/">
              <a className="text-gray-500 hover:text-primary">About</a>
            </Link>
            <Link href="/">
              <a className="text-gray-500 hover:text-primary">Privacy</a>
            </Link>
            <Link href="/">
              <a className="text-gray-500 hover:text-primary">Terms</a>
            </Link>
            <Link href="/">
              <a className="text-gray-500 hover:text-primary">Contact</a>
            </Link>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} StudyMate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
