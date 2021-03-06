import * as GL from './GL';
import EventDispatcher from 'happens';

let gl;

export default class TextureCube {
	constructor(options) {
		EventDispatcher(this);
		gl = GL.get();
		const defaults = {
			src: Array(6).fill(''),
			magFilter: gl.LINEAR,
			minFilter: gl.LINEAR,
			wrapS: gl.CLAMP_TO_EDGE,
			wrapT: gl.CLAMP_TO_EDGE,
			resizeToPow2: false,
		};

		Object.assign(this, defaults, options);

		this.texture = gl.createTexture();
		this.images = [];
		this._loaded = 0;

		this.update(this.placeholder());

		this.src.forEach((src, i) => {
			this.images[i] = new Image();
			this.images[i].onload = this.onImageLoaded;
			this.images[i].src = this.src[i];
		});
	}

	onImageLoaded = () => {
		this._loaded++;
		if (this._loaded === 6) {
			this.onTextureLoaded();
		}
	}

	onTextureLoaded = () => {
		this.update(this.images);
		this.emit('loaded');
	}

	update(images) {
		gl = GL.get();

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

		const targets = [
			gl.TEXTURE_CUBE_MAP_POSITIVE_X,
			gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
			gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
			gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
			gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
			gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
		];

		for (let i = 0; i < 6; i++) {
			const image = this._resizeImage(images[i]);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
			gl.texImage2D(targets[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, this.magFilter);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, this.minFilter);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, this.wrapS);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, this.wrapT);
		}
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	}

	placeholder() {
		const canvases = [];
		for (let i = 0; i < 6; i++) {
			const canvas = document.createElement('canvas');
			canvas.width = 128;
			canvas.height = 128;
			canvases.push(canvas);
		}
		return canvases;
	}

	_resizeImage(image) {
		if (!this.resizeToPow2) return image;

		// 2, 4, 8, 16... 4096
		const sizes = Array(12).fill(0).map((i, j) => {
			return Math.pow(2, j + 1);
		});

		// Return if the image size is already a power of 2
		sizes.forEach(size => {
			if (image.width === size && image.height === size) {
				return image;
			}
			return false;
		});

		const imageSize = Math.max(image.width, image.height);

		const size = sizes.reduce((prev, curr) => {
			return (Math.abs(curr - imageSize) < Math.abs(prev - imageSize) ? curr : prev);
		});

		// Draw canvas with texture cropped inside
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = size;
		canvas.height = size;
		ctx.drawImage(image, 0, 0, size, size);

		return canvas;
	}
}
