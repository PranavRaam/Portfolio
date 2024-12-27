// src/components/Navbar.jsx
export default function Navbar({ onFlip }) {
    return (
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center p-8 z-10 pointer-events-none">
        <a href="#" className="text-white no-underline uppercase font-['MOSKO_MAPPA'] text-2xl pointer-events-auto">
          TheLone
        </a>
        <button 
          onClick={onFlip}
          className="border-none outline-none text-white bg-black rounded px-4 py-2 uppercase font-['MOSKO_MAPPA'] text-2xl pointer-events-auto cursor-pointer"
        >
          Flip Tiles
        </button>
      </nav>
    );
  }