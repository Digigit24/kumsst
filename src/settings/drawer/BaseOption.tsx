import React from "react";

interface BaseOptionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

const BaseOption: React.FC<BaseOptionProps> = ({
    title,
    description,
    children,
}) => {
    return (
        <div className="border-b px-4 py-4">
            <div className="mb-3">
                <h4 className="text-sm font-semibold">{title}</h4>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
            {children}
        </div>
    );
};

export default BaseOption;
