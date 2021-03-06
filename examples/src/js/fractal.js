import {
	vec3,
} from 'gl-matrix';

export class Sierpinski {
	generate(size = 20, iterations = 2, grid = 3, holes = [4, 10, 12, 13, 14, 16, 22]) {
		this.size = size;
		this.grid = grid;
		this.iterations = iterations;
		this.holes = holes;
		const divisor = 1 / this.grid;
		let cubeSize = this.size * divisor;
		let positions = [vec3.create()];

		let tmp;
		for (let i = 0; i < this.iterations; i++) {
			tmp = [];

			for (let j = 0; j < positions.length; j++) {
				const position = positions[j];
				tmp = tmp.concat(this._sponge(position, cubeSize, this.grid, this.holes));
			}

			cubeSize *= divisor;

			positions = tmp;
		}

		const centerOffset = (this.size / 2) - (this.logarithmicScale() / 2);

		positions.forEach(position => {
			position[0] -= centerOffset;
			position[1] -= centerOffset;
			position[2] -= centerOffset;
		});

		return positions;
	}

	_sponge(position, cubeSize, grid, holes) {
		let i = 0;
		const positions = [];

		for (let levels = 0; levels < grid; levels++) {
			for (let rows = 0; rows < grid; rows++) {
				for (let columns = 0; columns < grid; columns++) {
					if (!this._inList(i, holes)) {
						const positionNew = vec3.create();
						positionNew[0] = position[0] + (rows * cubeSize);
						positionNew[1] = position[1] + (levels * cubeSize);
						positionNew[2] = position[2] + (columns * cubeSize);
						positions.push(positionNew);
					}
					i++;
				}
			}
		}

		return positions;
	}

	_inList(val, list) {
		let result = false;
		let item;

		for (let i = 0; i < list.length; i++) {
			item = list[i];
			if (item === val) {
				result = true;
				break;
			}
		}
		return result;
	}

	logarithmicScale() {
		return this.size / Math.pow(this.grid, this.iterations);
	}
}
