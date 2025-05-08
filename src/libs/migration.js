/* migration.js
 * This library provide compiled protobuf library for decoding otpauth-migration links
 * It is compiled with protobuf.js by ChatGPT 4o
 */

// Minimal standalone protobuf decoder for MigrationPayload (no external dependencies, CSP-safe)

(function (global) {
    function base64ToBytes(base64) {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    function decodeVarint(buffer, offset) {
        let result = 0, shift = 0, byte;
        do {
            byte = buffer[offset++];
            result |= (byte & 0x7f) << shift;
            shift += 7;
        } while (byte >= 0x80);
        return [result, offset];
    }

    function decodeLengthDelimited(buffer, offset) {
        const [length, newOffset] = decodeVarint(buffer, offset);
        const end = newOffset + length;
        return [buffer.slice(newOffset, end), end];
    }

    function decodeString(buffer, offset) {
        const [bytes, newOffset] = decodeLengthDelimited(buffer, offset);
        return [new TextDecoder().decode(bytes), newOffset];
    }

    function decodeBytes(buffer, offset) {
        return decodeLengthDelimited(buffer, offset);
    }

    function decodeOtpParameters(buffer, offset, end) {
        const param = {
            secret: [],
            name: "",
            issuer: "",
            algorithm: 0,
            digits: 0,
            type: 0,
            counter: 0
        };

        while (offset < end) {
            const [tag, newOffset] = decodeVarint(buffer, offset);
            offset = newOffset;
            const fieldNumber = tag >>> 3;

            switch (fieldNumber) {
                case 1:
                    [param.secret, offset] = decodeBytes(buffer, offset);
                    break;
                case 2:
                    [param.name, offset] = decodeString(buffer, offset);
                    break;
                case 3:
                    [param.issuer, offset] = decodeString(buffer, offset);
                    break;
                case 4:
                    [param.algorithm, offset] = decodeVarint(buffer, offset);
                    break;
                case 5:
                    [param.digits, offset] = decodeVarint(buffer, offset);
                    break;
                case 6:
                    [param.type, offset] = decodeVarint(buffer, offset);
                    break;
                case 7:
                    [param.counter, offset] = decodeVarint(buffer, offset);
                    break;
                default:
                    const [_, skip] = decodeVarint(buffer, offset);
                    offset = skip;
                    break;
            }
        }

        return [param, offset];
    }

    function decodeMigrationPayload(base64Data) {
        const buffer = base64ToBytes(decodeURIComponent(base64Data));
        let offset = 0;
        const payload = { otp_parameters: [] };

        while (offset < buffer.length) {
            const [tag, newOffset] = decodeVarint(buffer, offset);
            offset = newOffset;
            const fieldNumber = tag >>> 3;

            if (fieldNumber === 1) {
                const [bytes, nestedOffset] = decodeLengthDelimited(buffer, offset);
                const [param] = decodeOtpParameters(bytes, 0, bytes.length);
                payload.otp_parameters.push(param);
                offset = nestedOffset;
            } else {
                const [_, skip] = decodeVarint(buffer, offset);
                offset = skip;
            }
        }

        return payload;
    }

    // Expose to global scope
    global.decodeMigrationPayload = decodeMigrationPayload;
})(window);