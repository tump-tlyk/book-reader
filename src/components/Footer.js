import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xl font-bold text-white">BookShelf</span>
            </div>
            <p className="text-sm">Thu vien sach truc tuyen hang dau Viet Nam.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Kham pha</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/books" className="hover:text-white transition">Tat ca sach</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">Bang gia</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Ho tro</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Huong dan su dung</a></li>
              <li><a href="#" className="hover:text-white transition">Lien he</a></li>
              <li><a href="#" className="hover:text-white transition">Cau hoi thuong gap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Chinh sach</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Dieu khoan su dung</a></li>
              <li><a href="#" className="hover:text-white transition">Chinh sach bao mat</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 BookShelf. Tat ca quyen duoc bao luu.</p>
        </div>
      </div>
    </footer>
  );
}
