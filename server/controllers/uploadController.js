const supabase = require('../config/supabase');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Construct public URL (assuming server runs on port 5000 locally)
        // In production, this should be an env variable
        const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
        const fileUrl = `${serverUrl}/uploads/${req.file.filename}`;

        // Insert into Supabase 'documents' table
        const { data: document, error } = await supabase
            .from('documents')
            .insert([{
                filename: req.file.filename,
                url: fileUrl,
                mimetype: req.file.mimetype,
                size: req.file.size
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            // We continue even if DB tracking fails, but ideally we should rollback
        }

        res.json({
            success: true,
            url: fileUrl,
            document: document
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};
