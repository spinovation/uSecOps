import zipfile
import xml.etree.ElementTree as ET
import os

def get_docx_text(path):
    if not os.path.exists(path):
        return f"Error: File not found: {path}"
    try:
        doc = zipfile.ZipFile(path)
        xml_content = doc.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        text = []
        # Find all paragraph elements
        for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            p_text = []
            # Inside paragraphs, find text runs
            for run in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                if run.text:
                    p_text.append(run.text)
            if p_text:
                text.append("".join(p_text))
            else:
                # Add a blank line for empty paragraphs to maintain some formatting
                text.append("")
        return "\n".join(text)
    except Exception as e:
        return f"Error: {e}"

if __name__ == '__main__':
    text_content = get_docx_text('Unified_SecOps_Platform_Requirements_Document_v2.docx')
    # Save the output to a text file for easy viewing
    with open('requirements.txt', 'w', encoding='utf-8') as f:
        f.write(text_content)
    print("Done! Extracted text written to requirements.txt.")
