import { FaFile, FaFileImage, FaFileAudio, FaFileVideo, FaFilePdf } from "react-icons/fa";
import { FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileCsv } from "react-icons/fa";
import { FaFileAlt, FaFileCode, FaFileArchive } from "react-icons/fa";



const FileIconMapping = {

    "default" : FaFile,

    "image" : FaFileImage,
    "audio" : FaFileAudio,
    "video" : FaFileVideo,

    "application/pdf" : FaFilePdf,

    'application/msword' : FaFileWord,
    'application/vnd.ms-word' : FaFileWord,
    'application/vnd.oasis.opendocument.text': FaFileWord,
    'application/vnd.openxmlformats-officedocument.wordprocessingml' : FaFileWord,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : FaFileWord,

    'application/vnd.ms-excel' : FaFileExcel,
    'application/vnd.openxmlformats-officedocument.spreadsheetml' : FaFileExcel,
    'application/vnd.oasis.opendocument.spreadsheet' : FaFileExcel,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : FaFileExcel,

    'text/csv' : FaFileCsv,

    'application/vnd.ms-powerpoint' : FaFilePowerpoint,
    'application/vnd.openxmlformats-officedocument.presentationml' : FaFilePowerpoint,
    'application/vnd.oasis.opendocument.presentation' : FaFilePowerpoint,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' : FaFilePowerpoint,

    'text/plain' : FaFileAlt,
    'text/html' : FaFileCode,
    'application/json' : FaFileCode,

    'application/gzip' : FaFileArchive,
    'application/zip' : FaFileArchive,
    'application/x-zip-compressed' : FaFileArchive,
    'application/octet-stream' : FaFileArchive
};


export default function MimeTypeToIcon(mimeType) {

    if(FileIconMapping.hasOwnProperty(mimeType)) {
        return FileIconMapping[mimeType];
    }

    const genericType = mimeType.split("/")[0];
    return FileIconMapping.hasOwnProperty(genericType) ? FileIconMapping[genericType] : FileIconMapping.default;
}
