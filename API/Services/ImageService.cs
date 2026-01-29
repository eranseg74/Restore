using API.RequestHelpers;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class ImageService
    {
        private readonly Cloudinary _cloudinary;

        // Since we defined CloudinarySettings to be used via IOptions<CloudinarySettings> in the Program.cs file , we can use it here to extract the data in the appsettings, in the section that is under "Cloudinary" (all the required keys)
        public ImageService(IOptions<CloudinarySettings> config)
        {
            var acc = new Account(config.Value.CloudName, config.Value.ApiKey, config.Value.ApiSecret);
            _cloudinary = new Cloudinary(acc);
        }

        // Uploading an image to Cloudinary
        public async Task<ImageUploadResult> AddImageAsync(IFormFile file) // IFormFile - Represents a file sent with the HttpRequest.
        {
            var uploadResult = new ImageUploadResult();
            if (file.Length > 0)
            {
                // Using streming to upload the image. When using a strem a connection is opened and needsto be closed. The using keyword means that the var (stream in this case) will be initialized when the stream is opened and when the upload finishes, all the stream's resources will be disposed (calling Stream.Dispose())
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    // FileDescription - Initializes a new instance of the FileDescription class. Constructor to upload file from stream.
                    File = new FileDescription(file.Name, stream),
                    Folder = "Restore" // All the images will go under this folder in Cloudinary
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }
            return uploadResult;
        }

        // publicId used by cloudinary as a unique value for identifying images
        public async Task<DeletionResult> DeleteImageAsync(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result;
        }
    }
}
