declare module "multer" {
    import { Request, Response } from "express";

    export interface MulterError extends Error {
        code: string;
        field?: string;
        storageErrors?: Error[];
    }

    export interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer?: Buffer;
        stream?: NodeJS.ReadableStream;
    }

    export interface FileFilterCallback {
        (error: Error | null, acceptFile: boolean): void;
    }

    export interface StorageEngine {
        _handleFile(req: Request, file: File, cb: (error: Error | null, info?: File) => void): void;
        _removeFile(req: Request, file: File, cb: (error: Error | null) => void): void;
    }

    export interface DiskStorageConfiguration {
        destination?: string | ((req: Request, file: File, cb: (error: Error | null, destination: string) => void) => void);
        filename?: string | ((req: Request, file: File, cb: (error: Error | null, filename: string) => void) => void);
    }

    export interface MemoryStorageConfiguration {
        limits?: {
            fileSize?: number;
        };
    }

    export interface MulterOptions {
        dest?: string;
        storage?: StorageEngine;
        fileFilter?: (req: Request, file: File, cb: FileFilterCallback) => void;
        limits?: {
            fileSize?: number;
            files?: number;
            fields?: number;
            fieldSize?: number;
            fieldNameSize?: number;
            headerPairs?: number;
        };
    }

    export const diskStorage: (options: DiskStorageConfiguration) => StorageEngine;
    export const memoryStorage: (options?: MemoryStorageConfiguration) => StorageEngine;

    export default function multer(options?: MulterOptions): {
        single(fieldname: string): (req: Request, res: Response, next: (error?: Error | null) => void) => void;
        array(fieldname: string, maxCount?: number): (req: Request, res: Response, next: (error?: Error | null) => void) => void;
        fields(fields: Array<{ name: string; maxCount: number }>): (req: Request, res: Response, next: (error?: Error | null) => void) => void;
    };
}
