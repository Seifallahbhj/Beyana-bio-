/* eslint-env node */
/* global jest, Buffer, console */

// Mock global de multer pour Jest
const mockMiddleware = (req, res, next) => {
  if (!req.file && !req.files) {
    if (req.route && req.route.path.includes("avatar")) {
      req.file = {
        fieldname: "avatar",
        originalname: "test-avatar.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024000,
        destination: "/tmp",
        filename: "test-avatar.jpg",
        path: "/tmp/test-avatar.jpg",
        buffer: Buffer.from("fake-image-data"),
      };
    } else if (req.route && req.route.path.includes("images")) {
      req.files = [
        {
          fieldname: "images",
          originalname: "test-image.jpg",
          encoding: "7bit",
          mimetype: "image/jpeg",
          size: 1024000,
          destination: "/tmp",
          filename: "test-image.jpg",
          path: "/tmp/test-image.jpg",
          buffer: Buffer.from("fake-image-data"),
        },
      ];
    } else {
      req.file = {
        fieldname: "image",
        originalname: "test-image.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024000,
        destination: "/tmp",
        filename: "test-image.jpg",
        path: "/tmp/test-image.jpg",
        buffer: Buffer.from("fake-image-data"),
      };
    }
  }
  next();
};

function multerMock() {
  const middleware = Object.assign(mockMiddleware, {
    single: (fieldName) => {
      return (req, res, next) => {
        if (req.body && req.body[fieldName]) {
          const fileData = req.body[fieldName];
          if (typeof fileData === "string" && fileData.includes(".txt")) {
            req.fileValidationError = "Only image files are allowed";
            return next();
          }
        }
        if (
          req.file &&
          req.file.originalname &&
          req.file.originalname.endsWith(".txt")
        ) {
          req.fileValidationError = "Only image files are allowed";
          return next();
        }
        if (!req.file) {
          req.file = {
            fieldname: fieldName,
            originalname: "test-image.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            size: 1024,
            destination: "/tmp",
            filename: "test-image.jpg",
            path: "/tmp/test-image.jpg",
            buffer: Buffer.from("fake image data"),
          };
        }
        next();
      };
    },
    array: (fieldName) => {
      return (req, res, next) => {
        req.files = [
          {
            fieldname: fieldName,
            originalname: "test-image-1.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            size: 1024,
            destination: "/tmp",
            filename: "test-image-1.jpg",
            path: "/tmp/test-image-1.jpg",
            buffer: Buffer.from("fake image data 1"),
          },
          {
            fieldname: fieldName,
            originalname: "test-image-2.jpg",
            encoding: "7bit",
            mimetype: "image/jpeg",
            size: 1024,
            destination: "/tmp",
            filename: "test-image-2.jpg",
            path: "/tmp/test-image-2.jpg",
            buffer: Buffer.from("fake image data 2"),
          },
        ];
        next();
      };
    },
  });
  return middleware;
}

jest.mock("multer", () => multerMock);

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: "https://res.cloudinary.com/test/image/upload/test.jpg",
        public_id: "test",
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));
