import React from 'react';
import { useParams } from 'react-router-dom';
import CompletedCanvasPage from "@/components/features/editor/CompletedCanvasPage";

export default function CompletedPage() {
    const { canvasId } = useParams();
    return <CompletedCanvasPage canvasId={canvasId} />;
}
