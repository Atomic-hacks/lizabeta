"use client";

import Image from "next/image";
import { memo } from "react";

/** One optimized 2D painting. Hotspots live in the same aspect-ratio box. */
function RoomSceneBase() {
  return (
    <Image
      src="/images/world/elizabeth-room.webp"
      alt="A cosy purple bedroom with anime posters, fairy lights, two illustrated dogs asleep on the bed, a record player, a birthday cake and a wrapped present"
      width={1586}
      height={992}
      sizes="(max-width: 1600px) 100vw, 1600px"
      className="block h-full w-full object-cover"
    />
  );
}

export default memo(RoomSceneBase);
