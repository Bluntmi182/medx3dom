module("Fields");

           var SFVec2f = x3dom.fields.SFVec2f;
            test("SFVec2f", function() {
                // expect(1);
                // ok(true);
                var v1 = new SFVec2f();
                equals(v1.x, 0, "new SFVec2f().x");
                equals(v1.y, 0, "new SFVec2f().y");

                var v2 = new SFVec2f(5,8);
                equals(v2.x, 5, "new SFVec2f(5,8).x");
                equals(v2.y, 8, "new SFVec2f(5,8).y");

                var v1_add_v2 = v1.add(v2);
                equals(v1_add_v2.x, 5, "v1.add(v2).x");
                equals(v1_add_v2.y, 8, "v1.add(v2).y");

                var v1_sub_v2 = v1.subtract(v2);
                equals(v1_sub_v2.x, -5, "v1.subtract(v2).x");
                equals(v1_sub_v2.y, -8, "v1.subtract(v2).y");

                var v2_neg = v2.negate();
                equals(v2_neg.x, -5, "v2.negate().x");
                equals(v2_neg.y, -8, "v2.negate().y");

                var v3 = new SFVec2f(1,0);
                var v3_norm = v3.normalize();
                equals(v3_norm.x, 1, "v3.normalize().x");
                equals(v3_norm.y, 0, "v3.normalize().y");
                v3.setValueByStr("3 2");
                v3_norm = v3.normalize();
                equals(v3_norm.x, 0.8320502943378437, "v(3,2).normalize().x");
                equals(v3_norm.y, 0.5547001962252291, "v(3,2).normalise().y");

                v3.setValueByStr("2 4");
                equals(v3.x, 2, "v.setValueByStr('2 4').x");
                equals(v3.y, 4, "v.setValueByStr('2 4').y");
                v3.setValueByStr("3,6");
                equals(v3.x, 3, "v.setValueByStr('3 6').x");
                equals(v3.y, 6, "v.setValueByStr('3 6').y");
                v3.setValueByStr("+4,   -9");
                equals(v3.x, 4, "v.setValueByStr('+4,   -9').x");
                equals(v3.y, -9, "v.setValueByStr('+4,   -9').y");

                v2.setValueByStr("3 2");
                v3.setValueByStr("4 5");
                equals(v2.dot(v3), 22, "Testing dot product");

                v2.setValueByStr("3.8 2.3");
                v3.setValueByStr("4.45 5.55");
                equals(v2.dot(v3), 29.674999999999997, "Testing dot product");

                v2.setValueByStr("3, 9");
                var v2_mult = v2.multiply(3);
                equals(v2_mult.x, 9, "v2.setValueByStr('3, 9').multiply(3).x");
                equals(v2_mult.y, 27, "v2.setValueByStr('3, 9').multiply(3).y");

                equals(v2_mult.length(), 28.46049894151541399, "v2_mult.length()");

                var v4 = SFVec2f.parse("5.5 7.7777");
                equals(v4.x, 5.5, "Construct via SFVec2f.parse()");
                equals(v4.y, 7.7777, "Construct via SFVec2f.parse()");

                same([5.5, 7.7777], v4.toGL(), "v4.toGL()");
            });

            test("SFColor", function() {
                var c1 = new x3dom.fields.SFColor();
                equals(c1.r, 0, "new SFColor().r");
                equals(c1.g, 0, "new SFColor().g");
                equals(c1.b, 0, "new SFColor().b");

                var c2 = new x3dom.fields.SFColor(0.5, 0.1, 0.3);
                equals(c2.r, 0.5, "new SFColor(0.5, 0.1, 0.3).r");
                equals(c2.g, 0.1, "new SFColor(0.5, 0.1, 0.3).g");
                equals(c2.b, 0.3, "new SFColor(0.5, 0.1, 0.3).b");

                same(c2.toGL(), [0.5, 0.1, 0.3], "c2.toGL()");

                equals(c2.toString(), "{ r 0.5 g 0.1 b 0.3 }", "c2.toString()");

                var c3 = new x3dom.fields.SFColor.parse("0.2 0.9 1");
                equals(c3.r, 0.2, "SFColor.parse('0.2 0.9 1')");
                equals(c3.g, 0.9, "SFColor.parse('0.2 0.9 1')");
                equals(c3.b, 1, "SFColor.parse('0.2 0.9 1')");

                var c3 = new x3dom.fields.SFColor.parse("0.6,  1,   0.001");
                equals(c3.r, 0.6, "SFColor.parse('0.6,  1,   0.001')");
                equals(c3.g, 1, "SFColor.parse('0.6,  1,   0.001')");
                equals(c3.b, 0.001, "SFColor.parse('0.6,  1,   0.001')");
            });

            var SFColor = x3dom.fields.SFColor;
            var MFColor = x3dom.fields.MFColor;
            test("MFColor", function() {
                var c1 = new SFColor(1,0,0);
                var mc1 = new MFColor([c1, new SFColor()]);
                equals(c1, mc1[0], "mc1[0]=c1");
                // console.dir(mc1);
                // console.dir(Array);
                equals(mc1.length, 2, "mc1.length");

                var mc2 = MFColor.parse("0.5 0 0, 0.1 0.2 0.3, 1 1 1");
                equals(mc2.length, 3, "mc2.length");
                same(mc2[0], new SFColor(0.5, 0, 0));
                same(mc2[1], new SFColor(0.1, 0.2, 0.3));
                same(mc2[2], new SFColor(1, 1, 1));

                same(mc1.toGL(), [1, 0, 0, 0, 0, 0]);
                same(mc2.toGL(), [0.5, 0, 0, 0.1, 0.2, 0.3, 1, 1, 1]);
            });

            test("MFVec2f", function() {
                var c1 = new x3dom.fields.SFVec2f(1,0);
                var mc1 = new x3dom.fields.MFVec2f([c1, new x3dom.fields.SFVec2f()]);
                equals(c1, mc1[0], "mc1[0]=c1");
                // console.dir(mc1);
                // console.dir(Array);
                equals(mc1.length, 2, "mc1.length");

                var mc2 = x3dom.fields.MFVec2f.parse("0.5 0, 0.1 0.2, 1 1");
                equals(mc2.length, 3, "mc2.length");
                same(mc2[0], new x3dom.fields.SFVec2f(0.5, 0));
                same(mc2[1], new x3dom.fields.SFVec2f(0.1, 0.2));
                same(mc2[2], new x3dom.fields.SFVec2f(1, 1));

                same(mc1.toGL(), [1, 0, 0, 0]);
                same(mc2.toGL(), [0.5, 0, 0.1, 0.2, 1, 1]);
            });

            test("MFVec3f", function() {
                var c1 = new x3dom.fields.SFVec3f(1,0,0);
                var mc1 = new x3dom.fields.MFVec3f([c1, new x3dom.fields.SFVec3f()]);
                equals(c1, mc1[0], "mc1[0]=c1");
                // console.dir(mc1);
                // console.dir(Array);
                equals(mc1.length, 2, "mc1.length");

                var mc2 = x3dom.fields.MFVec3f.parse("0.5 0 0, 0.1 0.2 0.3, 1 1 1");
                equals(mc2.length, 3, "mc2.length");
                same(mc2[0], new x3dom.fields.SFVec3f(0.5, 0, 0));
                same(mc2[1], new x3dom.fields.SFVec3f(0.1, 0.2, 0.3));
                same(mc2[2], new x3dom.fields.SFVec3f(1, 1, 1));

                same(mc1.toGL(), [1, 0, 0, 0, 0, 0]);
                same(mc2.toGL(), [0.5, 0, 0, 0.1, 0.2, 0.3, 1, 1, 1]);
            });

            test("MFInt32", function() {
                var c1 = 4711;
                var mc1 = new x3dom.fields.MFInt32([c1, 4812]);
                equals(c1, mc1[0], "mc1[0]=c1");
                equals(mc1.length, 2, "mc1.length");

                same(mc1.toGL(), [4711, 4812]);
            });