import React from "react";

const SidebarItem = ({ title, subtitle, image}) => (
  <li className="bg-[#1A1A35] px-3 py-2 rounded-lg hover:bg-[#2A2A4B] transition-all flex items-center gap-3">
    <img
      src={image}
      alt="Album cover"
      className="w-10 h-10 rounded-sm object-cover"
      onError={(e) => {
        e.target.src = "https://via.placeholder.com/40";
      }}
    />

    <div>
      <p className="font-medium text-sm line-clamp-1">{title}</p>
      <p className="text-xs text-gray-400 line-clamp-1">{subtitle}</p>
    </div>
  </li>
);

export default SidebarItem;
