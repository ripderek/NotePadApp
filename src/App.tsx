// Importa los tipos necesarios
import { open } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile, readDir } from '@tauri-apps/api/fs';
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { DocumentIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import { DocumentCheckIcon } from '@heroicons/react/24/solid';
import { Card, CardHeader, CardBody, Input, IconButton, Tooltip } from '@material-tailwind/react';

function App() {
    const [filePath, setFilePath] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    const [fileContent, setFileContent] = useState<string>("");

    // Función para abrir un archivo existente para modificarlo
    const handleOpenFile = async () => {
        // Abre el diálogo del explorador de archivos para seleccionar un archivo .txt
        const selectedPath = await open({
            filters: [{ name: 'Text Files', extensions: ['txt'] }],
        });

        if (typeof selectedPath === 'string') {
            // Lee el contenido del archivo
            const content = await readTextFile(selectedPath);
            setFilePath(selectedPath);
            const { fileNameTXT } = extractFileInfo(selectedPath);
            setFileName(fileNameTXT);
            setFileContent(content);
        }
    };

    // Función para extraer la información de un archivo seleccionado
    const extractFileInfo = (fullPath: string) => {
        const lastSlashIndex = fullPath.lastIndexOf('\\');
        const fileNameWithExt = fullPath.substring(lastSlashIndex + 1);
        //const fileDirectory = fullPath.substring(0, lastSlashIndex + 1);
        const fileNameTXT = fileNameWithExt.split('.').slice(0, -1).join('.');
        return { fileNameTXT };
    };

    // Función para abrir un diálogo para seleccionar un directorio
    const handleSelectDirectory = async () => {
        const selectedPath = await open({
            directory: true,
            multiple: false,
            recursive: true,
        });

        if (typeof selectedPath === 'string') {
            const PathCompleto = selectedPath + "\\" + fileName + '.txt';
            const VerificarRutaNoRepetida = await checkFileExists(selectedPath, fileName + '.txt');
            if (!VerificarRutaNoRepetida) {
                handleSaveFile(PathCompleto);
            }
        }
    };

    const SaveFile = () => {
        if (filePath) {
            handleSaveFile(filePath);
        } else {
            if (isStringEmpty(fileName)) {
                alert("Debe ponerle un nombre al archivo a crear");
            } else {
                handleSelectDirectory();
            }
        }
    };

    // Función para manejar el evento onChange del editor
    const OnchangeEditor = (value: string | undefined, event: any) => {
        console.log(event)
        if (value) {
            setFileContent(value);
        }
    };

    const handleSaveFile = async (fullPath: string) => {
        try {
            await writeTextFile(fullPath, fileContent);
            setFilePath(fullPath);
            alert("Archivo guardado correctamente");
        } catch (error) {
            alert("Error al guardar el archivo");
            console.error("Error al guardar el archivo:", error);
        }
    };

    const checkFileExists = async (directoryPath: string, fileName: string) => {
        try {
            const files = await readDir(directoryPath);
            //const fileExists = files.some((file: { name: string }) => file.name === fileName);
            const fileExists = files.some((file: { name?: string }) => file.name === fileName);

            if (fileExists) {
                alert(`El archivo ${fileName} ya existe en la ruta ${directoryPath}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error al leer la carpeta:", error);
            return false;
        }
    };

    const Limpiar = () => {
        setFilePath("");
        setFileName("");
        setFileContent("");
    };

    const isStringEmpty = (str: string) => {
        return str.trim().length === 0;
    };

    const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFileName = e.target.value.replace(/[\\/:*?"<>|]/g, '');
        setFileName(newFileName);
    };

    return (
        <div>
            <Card className="mt-7 shadow-none">
                <CardHeader variant="gradient" className="shadow-none flex rounded-none h-auto">
                    {filePath ? (
                        <Input  crossOrigin="anonymous" placeholder="Nombre archivo" size="md" variant="static" value={fileName} disabled />
                    ) : (
                        <Input  crossOrigin="anonymous" placeholder="Nombre archivo" size="md" variant="static" value={fileName} onChange={handleFileNameChange} />
                    )}
                    <Tooltip content="Guardar">
                        <IconButton size="lg" ripple={false} onClick={SaveFile} color="green" className="ml-2">
                            <DocumentCheckIcon className="h-5 w-5" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content="Abrir archivo">
                        <IconButton size="lg" ripple={false} onClick={handleOpenFile} color="yellow" className="ml-2">
                            <FolderOpenIcon className="h-5 w-5" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content="Nuevo archivo">
                        <IconButton size="lg" ripple={false} onClick={Limpiar} color="red" className="ml-2">
                            <DocumentIcon className="h-5 w-5" />
                        </IconButton>
                    </Tooltip>
                </CardHeader>
                <CardBody>
                    <Editor
                        height="80vh"
                        value={fileContent}
                        onChange={OnchangeEditor}
                    />
                </CardBody>
            </Card>
        </div>
    );
}

export default App;
