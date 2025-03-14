import { DndContext, UniqueIdentifier } from "@dnd-kit/core";
import { DragEndEvent } from "@dnd-kit/core/dist/types";
import { CSSProperties, useRef } from "react";
import useApp from "../../context/AppContext";
import Placeholder from "./Placeholder";
import {
    clampPosition,
    clampSize,
    clampTransform,
    isDraggableComponent,
} from "../../lib/coords";
import ToFront from "../../icons/ToFront";
import ToBack from "../../icons/ToBack";
import DraggableImage from "./DraggableImage";
import PlusCircle from "../../icons/PlusCircle";
import usePosition from "../../context/PositionContext";
import useDesign, {Component} from "../../context/DesignContext";
import clsx from "clsx";
import { invertRgbString } from "../../lib/utils";
import DraggableText from "./DraggableText";
import Edit from "../../icons/Edit";
import Color from "../../icons/Color";

const Editor = () => {
    const { activePositionMethod } = usePosition();
    const {
        designDispatch,
        activeComponent,
        setActiveComponent,
        activeDesign,
    } = useDesign();
    const { selectedColor, setOpenPrintModal, setOpenEditPrintModal, setOpenChangeColorModal } = useApp();

    const container = {
        width: Number(activePositionMethod?.position.width),
        height: Number(activePositionMethod?.position.height),
        x: Number(activePositionMethod?.position.x),
        y: Number(activePositionMethod?.position.y),
    };

    const svgRef = useRef<SVGSVGElement>(null);

    const getActiveComponent = () => {
        return activeDesign?.components.find(
            (item) => item.id === activeComponent
        ) as Component | undefined;
    }
    const updateDraggedComponentPosition = ({
                                                delta,
                                                active,
                                            }: DragEndEvent) => {
        const component = activeDesign?.components.find(
            (item) => item.id === active.id
        );
        if (
            (!delta.x && !delta.y) ||
            !component ||
            !isDraggableComponent(component)
        )
            return;

        const clampedPoint = clampTransform(
            svgRef.current,
            delta,
            component,
            container
        );

        designDispatch({
            type: "DRAG_END",
            payload: {
                position: {
                    x: component.position.x + clampedPoint.x,
                    y: component.position.y + clampedPoint.y,
                },
                componentId: active.id as UniqueIdentifier,
            },
        });
    };

    const onResizeEnd = (
        e: DragEndEvent,
        size: { width: number; height: number }
    ) => {
        const { active } = e;
        const component = activeDesign?.components.find(
            (item) => item.id === active.id
        );

        if (!component || !isDraggableComponent(component)) return;

        const newSize = {
            width: component.size.width + size.width,
            height: component.size.height + size.height,
        };
        const newComponent = {
            ...component,
            size: newSize,
        };

        const clampedPoint = clampPosition(
            { x: -size.width / 2, y: -size.height / 2 },
            newComponent,
            container
        );

        designDispatch({
            type: "RESIZE_DRAG_END",
            payload: {
                size: {
                    width: newComponent.size.width,
                    height: newComponent.size.height,
                },
                position: {
                    x: component.position.x + clampedPoint.x,
                    y: component.position.y + clampedPoint.y,
                },
                componentId: active.id as UniqueIdentifier,
            },
        });
    };

    const onRotateEnd = (e: DragEndEvent, angle: number) => {
        const { active } = e;

        const component = activeDesign?.components.find(
            (item) => item.id === active.id
        );
        if (!component || !isDraggableComponent(component)) return;

        const clampedSize = clampSize(
            { width: 0, height: 0 },
            component.size,
            container,
            angle
        );
        const clampedComponentSize = {
            width: component.size.width + clampedSize.width,
            height: component.size.height + clampedSize.height,
        };

        const clampedPoint = clampPosition(
            { x: 0, y: 0 },
            { ...component, size: clampedComponentSize, rotation: angle },
            container
        );
        const clampedComponentPosition = {
            x: component.position.x + clampedPoint.x,
            y: component.position.y + clampedPoint.y,
        };

        designDispatch({
            type: "ROTOATE_DRAG_END",
            payload: {
                rotation: angle,
                position: clampedComponentPosition,
                size: clampedComponentSize,
                componentId: active.id as UniqueIdentifier,
            },
        });
    };

    const onDelete = () => {
        if (!activeComponent) return;

        designDispatch({
            type: "REMOVE_COMPONENT",
            payload: {
                componentId: activeComponent,
            },
        });

        if (activeDesign && activeDesign.components?.length > 0) {
            setActiveComponent(activeDesign.components[0].id);
        } else {
            setActiveComponent(null);
        }
    };

    if (!activePositionMethod) {
        return <Placeholder />;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <DndContext onDragEnd={updateDraggedComponentPosition}>
                <svg
                    version="1.2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 800 800"
                    className="outline-none pointer-events-none"
                >
                    <g
                        style={
                            {
                                "--fill-color-change": selectedColor?.rgbColor?.rgb,
                            } as CSSProperties
                        }
                        className="pointer-events-none *:pointer-events-none touch-none *:touch-none"
                        dangerouslySetInnerHTML={{
                            __html: `
          <style>
          .fill-color-change { fill: var(--fill-color-change) !important; }
        </style>
        ${activePositionMethod.position.svg_content}`,
                        }}
                    ></g>

                    <svg
                        width={activePositionMethod.position.width}
                        height={activePositionMethod.position.height}
                        x={activePositionMethod.position.x}
                        y={activePositionMethod.position.y}
                        className="overflow-visible outline-none pointer-events-none *:pointer-events-none touch-none *:touch-none"
                        ref={svgRef}
                    >
                        <rect
                            width={container.width}
                            height={container.height}
                            strokeWidth="2"
                            strokeDasharray="12,8"
                            fill="transparent"
                            style={{
                                stroke: selectedColor?.rgbColor
                                    ? invertRgbString(selectedColor.rgbColor.rgb)
                                    : "#1B6CFF",
                            }}
                        />

                        {/* Vertical Line */}
                        <line
                            x1={container.width / 2}
                            y1="0"
                            x2={container.width / 2}
                            y2={container.height}
                            strokeWidth="1"
                            style={{
                                stroke: selectedColor?.rgbColor
                                    ? invertRgbString(selectedColor.rgbColor.rgb)
                                    : "#FD1212",
                            }}
                        />

                        {/* Horizontal Line */}
                        <line
                            x1="0"
                            y1={container.height / 2}
                            x2={container.width}
                            y2={container.height / 2}
                            strokeWidth="1"
                            style={{
                                stroke: selectedColor?.rgbColor
                                    ? invertRgbString(selectedColor.rgbColor.rgb)
                                    : "#FD1212",
                            }}
                        />

                        <text
                            x={container.width / 2}
                            y={-10}
                            textAnchor="middle"
                            fontSize="24"
                            fontWeight="600"
                            style={{
                                fill: selectedColor?.rgbColor
                                    ? invertRgbString(selectedColor.rgbColor.rgb)
                                    : "#1b6cff",
                            }}
                        >
                            {activePositionMethod.position.width_text}
                        </text>

                        <text
                            x={-10}
                            y={container.height / 2}
                            textAnchor="middle"
                            fontSize="24"
                            fontWeight="600"
                            transform={`rotate(-90, -10, ${
                                container.height / 2
                            })`}
                            style={{
                                fill: selectedColor?.rgbColor
                                    ? invertRgbString(selectedColor.rgbColor.rgb)
                                    : "#1b6cff",
                            }}
                        >
                            {activePositionMethod.position.height_text}
                        </text>

                        {activeDesign?.components.map((component) => {
                            if (component.type === "image") {
                                return (
                                    <DraggableImage
                                        container={container}
                                        component={component}
                                        key={component.id}
                                        svgRef={svgRef}
                                        onResizeEnd={onResizeEnd}
                                        onRotateEnd={onRotateEnd}
                                        onDelete={onDelete}
                                        onFocus={() =>
                                            setActiveComponent(component.id)
                                        }
                                        selectedElement={
                                            activeComponent === component.id
                                        }
                                    />
                                );
                            }
                            if (component.type === "text") {
                                return (
                                    <DraggableText
                                        container={container}
                                        component={component}
                                        key={component.id}
                                        svgRef={svgRef}
                                        onResizeEnd={onResizeEnd}
                                        onRotateEnd={onRotateEnd}
                                        onDelete={onDelete}
                                        onFocus={() =>
                                            setActiveComponent(component.id)
                                        }
                                        selectedElement={
                                            activeComponent === component.id
                                        }
                                    />
                                );
                            }
                        })}

                        {(activeDesign === undefined ||
                            activeDesign.components.length === 0) && (
                            <g
                                width={50}
                                height={50}
                                className="cursor-pointer !pointer-events-auto !touch-auto translate-x-[50%] translate-y-[50%] scale-[2] md:scale-100"
                                onClick={() => setOpenPrintModal("image")}
                            >
                                <g
                                    style={{
                                        transform: "translate3d(-50%, -50%, 0)",
                                        transformBox: "content-box",
                                    }}
                                >
                                    <rect
                                        width={50}
                                        height={50}
                                        fill={
                                            selectedColor?.rgbColor
                                                ? invertRgbString(selectedColor.rgbColor.rgb)
                                                : "#1B6CFF"
                                        }
                                        rx="4px"
                                    />
                                    <PlusCircle
                                        color={
                                            selectedColor?.rgbColor ? selectedColor.rgbColor.rgb : "#ffffff"
                                        }
                                        width={25}
                                        height={25}
                                        x={12.5}
                                        y={12.5}
                                    />
                                </g>
                            </g>
                        )}
                    </svg>
                </svg>
            </DndContext>

            <div
                className={clsx(
                    "flex flex-row justify-center items-center absolute bottom-0 lg:bottom-12",
                    {
                        hidden: !activeComponent || !activeDesign,
                    }
                )}
            >
                <div className="w-fit p-3 bg-white shadow rounded flex flex-row gap-6 items-center text-xs text-center text-nowrap">
                    {activeDesign && activeDesign.components.length > 1 && (
                        <button
                            className="flex flex-col gap-2.5 items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!activeComponent) return;

                                designDispatch({
                                    type: "BRING_TO_FRONT",
                                    payload: { componentId: activeComponent },
                                });
                            }}
                        >
                            <ToFront />
                            <span>Naar voren</span>
                        </button>
                    )}

                    <button
                        className={clsx(
                            "flex flex-col gap-2.5 items-center justify-center",
                            { "opacity-30": !activeComponent }
                        )}
                        disabled={!activeComponent}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!activeComponent || !activeDesign) return;
                            const component = activeDesign.components.find(
                                (i) => i.id === activeComponent
                            );

                            if (component) {
                                setOpenEditPrintModal(component);
                            }
                        }}
                    >
                        <Edit />
                        <span>Aanpassen</span>
                    </button>
                    {activeDesign && activeDesign.components.length > 1 && (
                        <button
                            className="flex flex-col gap-2.5 items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!activeComponent) return;
                                designDispatch({
                                    type: "SEND_TO_BACK",
                                    payload: { componentId: activeComponent },
                                });
                            }}
                        >
                            <ToBack />
                            <span>Naar achteren</span>
                        </button>
                    )}
                    {(() => {
                        const comp = getActiveComponent();

                        if (!comp || comp.type !== "image") return null;
                        if (!comp.image.filename.includes('svg')) return null;

                        return (
                            <button
                                className="flex flex-col gap-2.5 items-center justify-center"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!activeComponent || !activeDesign) return;
                                    setOpenChangeColorModal(comp);
                                }}
                            >
                                <Color />
                                <span>Logo kleur</span>
                            </button>
                        );
                    })()}

                </div>
            </div>
        </div>
    );
};

export default Editor;
