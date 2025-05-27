"use client"

export default function Footer() {

    const currentYear = new Date().getFullYear();


    return (
        <footer className=" text-white py-4 shadow-none">
            <div className="container mx-auto text-center">
                <p className="text-sm">© {currentYear} Quizownik. All rights reserved.</p>
                <p className="text-sm">Made with ❤️ by Quizownik Team</p>
            </div>
        </footer>
    );
}