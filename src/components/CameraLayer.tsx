"use client";

import dynamic from "next/dynamic";

const CameraCanvas = dynamic(() => import("@/components/3d/CameraCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function CameraLayer() {
  return <CameraCanvas />;
}
