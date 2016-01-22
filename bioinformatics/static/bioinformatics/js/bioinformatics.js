function init() {
    if (window.goSamples) goSamples(); // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make; // for conciseness in defining templates

    bioDiagram =
        $(go.Diagram, "bioDiagram", // must name or refer to the DIV HTML element
            {
                grid: $(go.Panel, "Grid",
                    $(go.Shape, "LineH", {
                        stroke: "lightgray",
                        strokeWidth: 0.5
                    }),
                    $(go.Shape, "LineH", {
                        stroke: "gray",
                        strokeWidth: 0.5,
                        interval: 10
                    }),
                    $(go.Shape, "LineV", {
                        stroke: "lightgray",
                        strokeWidth: 0.5
                    }),
                    $(go.Shape, "LineV", {
                        stroke: "gray",
                        strokeWidth: 0.5,
                        interval: 10
                    })
                ),
                allowDrop: true, // must be true to accept drops from the Palette
                "draggingTool.dragsLink": true,
                "draggingTool.isGridSnapEnabled": true,
                "linkingTool.isUnconnectedLinkValid": true,
                "linkingTool.portGravity": 20,
                "relinkingTool.isUnconnectedLinkValid": true,
                "relinkingTool.portGravity": 20,
                "relinkingTool.fromHandleArchetype": $(go.Shape, "Diamond", {
                    segmentIndex: 0,
                    cursor: "pointer",
                    desiredSize: new go.Size(8, 8),
                    fill: "tomato",
                    stroke: "darkred"
                }),
                "relinkingTool.toHandleArchetype": $(go.Shape, "Diamond", {
                    segmentIndex: -1,
                    cursor: "pointer",
                    desiredSize: new go.Size(8, 8),
                    fill: "darkred",
                    stroke: "tomato"
                }),
                "linkReshapingTool.handleArchetype": $(go.Shape, "Diamond", {
                    desiredSize: new go.Size(7, 7),
                    fill: "lightblue",
                    stroke: "deepskyblue"
                }),
                rotatingTool: $(TopRotatingTool), // defined below
                "rotatingTool.snapAngleMultiple": 15,
                "rotatingTool.snapAngleEpsilon": 15,
                // don't set some properties until after a new model has been loaded
                "InitialLayoutCompleted": loadDiagramProperties, // this DiagramEvent listener is defined below
                "undoManager.isEnabled": true,
                // support editing the properties of the selected person in HTML
                "ChangedSelection": onSelectionChanged,
                "TextEdited": onTextEdited,

            });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    bioDiagram.addDiagramListener("Modified", function(e) {
        var button = document.getElementById("saveButton");
        if (button) button.disabled = !bioDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (bioDiagram.isModified) {
            if (idx < 0) document.title += "*";
        } else {
            if (idx >= 0) document.title = document.title.substr(0, idx);
        }
    });

    // Define a function for creating a "port" that is normally transparent.
    // The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
    // and where the port is positioned on the node, and the boolean "output" and "input" arguments
    // control whether the user can draw links from or to the port.
    function makePort(name, spot, output, input) {
        // the port is basically just a small transparent square
        return $(go.Shape, "Circle", {
            fill: null, // not seen, by default; set to a translucent gray by showSmallPorts, defined below
            stroke: null,
            desiredSize: new go.Size(7, 7),
            alignment: spot, // align the port on the main Shape
            alignmentFocus: spot, // just inside the Shape
            portId: name, // declare this object to be a "port"
            fromSpot: spot,
            toSpot: spot, // declare where links may connect at this port
            fromLinkable: output,
            toLinkable: input, // declare whether the user may draw links to/from here
            cursor: "pointer" // show a different cursor to indicate potential link point
        });
    }

    var nodeSelectionAdornmentTemplate =
        $(go.Adornment, "Auto",
            $(go.Shape, {
                fill: null,
                stroke: "deepskyblue",
                strokeWidth: 1.5,
                strokeDashArray: [4, 2]
            }),
            $(go.Placeholder)
        );

    var nodeResizeAdornmentTemplate =
        $(go.Adornment, "Spot", {
                locationSpot: go.Spot.Right
            },
            $(go.Placeholder),
            $(go.Shape, {
                alignment: go.Spot.TopLeft,
                cursor: "nw-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                alignment: go.Spot.Top,
                cursor: "n-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                alignment: go.Spot.TopRight,
                cursor: "ne-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),

            $(go.Shape, {
                alignment: go.Spot.Left,
                cursor: "w-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                alignment: go.Spot.Right,
                cursor: "e-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),

            $(go.Shape, {
                alignment: go.Spot.BottomLeft,
                cursor: "se-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                alignment: go.Spot.Bottom,
                cursor: "s-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                alignment: go.Spot.BottomRight,
                cursor: "sw-resize",
                desiredSize: new go.Size(6, 6),
                fill: "lightblue",
                stroke: "deepskyblue"
            })
        );

    var nodeRotateAdornmentTemplate =
        $(go.Adornment, {
                locationSpot: go.Spot.Center,
                locationObjectName: "CIRCLE"
            },
            $(go.Shape, "Circle", {
                name: "CIRCLE",
                cursor: "pointer",
                desiredSize: new go.Size(7, 7),
                fill: "lightblue",
                stroke: "deepskyblue"
            }),
            $(go.Shape, {
                geometryString: "M3.5 7 L3.5 30",
                isGeometryPositioned: true,
                stroke: "deepskyblue",
                strokeWidth: 1.5,
                strokeDashArray: [4, 2]
            })
        );

    // this function changes the category of the node data to cause the Node to be replaced
    function changeCategory(e, obj) {
        var node = obj.part;
        if (node) {
            var diagram = node.diagram;
            diagram.startTransaction("changeCategory");
            var cat = diagram.model.getCategoryForNodeData(node.data);
            if (cat === "simple")
                cat = "detail";
            else
                cat = "simple";
            diagram.model.setCategoryForNodeData(node.data, cat);
            diagram.commitTransaction("changeCategory");
        }
    }

    var simpletemplate =
        $(go.Node, "Spot", {
                locationSpot: go.Spot.Center
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), {
                selectable: true,
                selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
            }, {
                resizable: true,
                resizeObjectName: "PANEL",
                resizeAdornmentTemplate: nodeResizeAdornmentTemplate
            }, {
                rotatable: true,
                rotateAdornmentTemplate: nodeRotateAdornmentTemplate
            },
            new go.Binding("angle").makeTwoWay(),
            // the main object is a Panel that surrounds a TextBlock with a Shape
            $(go.Panel, "Auto", {
                    name: "PANEL"
                },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                $(go.Shape, "Rectangle", // default figure
                    {
                        portId: "", // the default port: if no spot on link data, use closest side
                        fromLinkable: true,
                        toLinkable: true,
                        cursor: "pointer",
                        fill: "white" // default color
                    },
                    new go.Binding("figure"),
                    new go.Binding("fill")),
                $(go.TextBlock, {
                        font: "bold 11pt Helvetica, Arial, sans-serif",
                        margin: 4,
                        maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit,
                        editable: false
                    },
                    new go.Binding("text", "name").makeTwoWay())
            ),
            $("Button", {
                    alignment: go.Spot.TopRight
                },
                $(go.Shape, "AsteriskLine", {
                    width: 8,
                    height: 8
                }), {
                    click: changeCategory
                }),
            // four small named ports, one on each side:
            makePort("T", go.Spot.Top, false, true),
            makePort("L", go.Spot.Left, true, true),
            makePort("R", go.Spot.Right, true, true),
            makePort("B", go.Spot.Bottom, true, false), { // handle mouse enter/leave events to show/hide the ports
                mouseEnter: function(e, node) {
                    showSmallPorts(node, true);
                },
                mouseLeave: function(e, node) {
                    showSmallPorts(node, false);
                }
            }
        );

    var detailtemplate =
        $(go.Node, "Spot", {
                locationSpot: go.Spot.Center
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), {
                selectable: true,
                selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
            }, {
                resizable: true,
                resizeObjectName: "PANEL",
                resizeAdornmentTemplate: nodeResizeAdornmentTemplate
            }, {
                rotatable: true,
                rotateAdornmentTemplate: nodeRotateAdornmentTemplate
            },
            new go.Binding("angle").makeTwoWay(),
            // the main object is a Panel that surrounds a TextBlock with a Shape
            $(go.Panel, "Auto", {
                    name: "PANEL"
                },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                $(go.Shape, "Rectangle", // default figure
                    {
                        portId: "", // the default port: if no spot on link data, use closest side
                        fromLinkable: true,
                        toLinkable: true,
                        cursor: "pointer",
                        fill: "white" // default color
                    },
                    new go.Binding("figure"),
                    new go.Binding("fill")),
                $(go.TextBlock, {
                        row: 1,
                        column: 0,
                        font: "italic 8pt Helvetica, Arial, serif",
                        maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit,
                        editable: false,
                        stroke: "white"
                    },
                    new go.Binding("text", "image_id").makeTwoWay()),
                $(go.Panel, "Table", {
                        defaultAlignment: go.Spot.Left
                    },
                    $(go.TextBlock, {
                        row: 0,
                        column: 0,
                        font: "bold 8pt Helvetica, Arial, sans-serif",
                        margin: 4,
                        maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit,
                        editable: false,
                        text: "Name:"
                    }),
                    $(go.TextBlock, {
                            row: 0,
                            column: 1,
                            font: "italic 8pt Helvetica, Arial, serif",
                            margin: 4,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text", "name").makeTwoWay()),
                    $(go.TextBlock, {
                        row: 1,
                        column: 0,
                        font: "bold 8pt Helvetica, Arial, sans-serif",
                        margin: 4,
                        maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit,
                        editable: false,
                        text: "Image:"
                    }),
                    $(go.TextBlock, {
                            row: 1,
                            column: 1,
                            font: "italic 8pt Helvetica, Arial, serif",
                            margin: 4,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text", "image_id").makeTwoWay()),
                    $(go.TextBlock, {
                        row: 2,
                        column: 0,
                        font: "bold 8pt Helvetica, Arial, sans-serif",
                        margin: 4,
                        maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit,
                        editable: false,
                        text: "Description:"
                    }),
                    $(go.TextBlock, {
                            row: 2,
                            column: 1,
                            font: "italic 8pt Helvetica, Arial, serif",
                            margin: 4,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: false
                        },
                        new go.Binding("text", "desc").makeTwoWay())
                )
            ),
            $("Button", {
                    alignment: go.Spot.TopRight
                },
                $(go.Shape, "AsteriskLine", {
                    width: 8,
                    height: 8
                }), {
                    click: changeCategory
                }),
            // four small named ports, one on each side:
            makePort("T", go.Spot.Top, false, true),
            makePort("L", go.Spot.Left, true, true),
            makePort("R", go.Spot.Right, true, true),
            makePort("B", go.Spot.Bottom, true, false), { // handle mouse enter/leave events to show/hide the ports
                mouseEnter: function(e, node) {
                    showSmallPorts(node, true);
                },
                mouseLeave: function(e, node) {
                    showSmallPorts(node, false);
                }
            }
        );

    function showSmallPorts(node, show) {
        node.ports.each(function(port) {
            if (port.portId !== "") { // don't change the default port, which is the big shape
                port.fill = show ? "rgba(0,0,0,.3)" : null;
            }
        });
    }

    var templmap = new go.Map("string", go.Node);
    templmap.add("simple", simpletemplate);
    templmap.add("detail", detailtemplate);
    bioDiagram.nodeTemplateMap = templmap;

    var linkSelectionAdornmentTemplate =
        $(go.Adornment, "Link",
            $(go.Shape,
                // isPanelMain declares that this Shape shares the Link.geometry
                {
                    isPanelMain: true,
                    fill: null,
                    stroke: "deepskyblue",
                    strokeWidth: 0
                }) // use selection object's strokeWidth
        );

    bioDiagram.linkTemplate =
        $(go.Link, // the whole link panel
            {
                selectable: true,
                selectionAdornmentTemplate: linkSelectionAdornmentTemplate
            }, {
                relinkableFrom: true,
                relinkableTo: true,
                reshapable: true
            }, {
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5,
                toShortLength: 4
            },
            new go.Binding("points").makeTwoWay(),
            $(go.Shape, // the link path shape
                {
                    isPanelMain: true,
                    strokeWidth: 2
                }),
            $(go.Shape, // the arrowhead
                {
                    toArrow: "Standard",
                    stroke: null
                }),
            $(go.Panel, "Auto",
                new go.Binding("visible", "isSelected").ofObject(),
                $(go.Shape, "RoundedRectangle", // the link shape
                    {
                        fill: "#F8F8F8",
                        stroke: null
                    }),
                $(go.TextBlock, {
                        textAlign: "center",
                        font: "10pt helvetica, arial, sans-serif",
                        stroke: "#919191",
                        margin: 2,
                        minSize: new go.Size(10, NaN),
                        editable: true
                    },
                    new go.Binding("text").makeTwoWay())
            )
    );


    // initialize the Palette that is on the left side of the page
    bioPalette =
        $(go.Palette, "bioPalette", // must name or refer to the DIV HTML element
            {
                maxSelectionCount: 1,
                nodeTemplateMap: bioDiagram.nodeTemplateMap, // share the templates used by bioDiagram
                linkTemplate: // simplify the link template, just in this Palette
                $(go.Link, { // because the GridLayout.alignment is Location and the nodes have locationSpot == Spot.Center,
                        // to line up the Link in the same manner we have to pretend the Link has the same location spot
                        locationSpot: go.Spot.Center,
                        selectionAdornmentTemplate: $(go.Adornment, "Link", {
                                locationSpot: go.Spot.Center
                            },
                            $(go.Shape, {
                                isPanelMain: true,
                                fill: null,
                                stroke: "deepskyblue",
                                strokeWidth: 0
                            }),
                            $(go.Shape, // the arrowhead
                                {
                                    toArrow: "Standard",
                                    stroke: null
                                })
                        )
                    }, {
                        routing: go.Link.AvoidsNodes,
                        curve: go.Link.JumpOver,
                        corner: 5,
                        toShortLength: 4
                    },
                    new go.Binding("points"),
                    $(go.Shape, // the link path shape
                        {
                            isPanelMain: true,
                            strokeWidth: 2
                        }),
                    $(go.Shape, // the arrowhead
                        {
                            toArrow: "Standard",
                            stroke: null
                        })
                ),
                model: new go.GraphLinksModel([ // specify the contents of the Palette
                    {
                        name: "Start",
                        desc: "Start Node",
                        image: "",
                        input: "",
                        output: "",
                        command: "",
                        figure: "Circle",
                        fill: "green",
                        category: "simple"
                    }, {
                        name: "New Node",
                        desc: "",
                        image: "",
                        input: "",
                        output: "",
                        command: "",
                        category: "simple",
                    }, {
                        name: "End",
                        desc: "End Node",
                        image: "",
                        input: "",
                        output: "",
                        command: "",
                        figure: "Circle",
                        fill: "red",
                        category: "simple"
                    }
                ], [
                    // the Palette also has a disconnected Link, which the user can drag-and-drop
                    {
                        points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)])
                    }
                ])
            });
}

// Allow the user to edit text when a single node is selected
function onSelectionChanged(e) {
    var node = e.diagram.selection.first();
    if (node instanceof go.Node) {
        updateProperties(node.data);
    } else {
        updateProperties(null);
    }
}

// Update the HTML elements for editing the properties of the currently selected node, if any
function updateProperties(data) {
    if (data === null) {
        document.getElementById("propertiesPanel").style.display = "none";
        document.getElementById("node-name").value = "";
        $('#node-image option[value=none]').prop('selected', true);
        document.getElementById("node-command").value = "";
        document.getElementById("node-desc").value = "";
        // document.getElementById("var_name").value = "";
        // document.getElementById("var_value").value = "";
        document.getElementById("container_name_output").value = "";
        document.getElementById("object_name_output").value = "";
    } else {
        document.getElementById("propertiesPanel").style.display = "block";
        document.getElementById("node-name").value = data.name || "";
        console.log(JSON.stringify(data.image));
        if (data.image == "") {
            $('#node-image option[value=none]').prop('selected', true);
        } else {
            var image_val = JSON.stringify(data.image);
            $("#node-image option[value='" + image_val + "']").prop('selected', true);
        }
        document.getElementById("node-command").value = data.command || "";
        document.getElementById("node-desc").value = data.desc || "";
        if (data.input.var_name_input != "") {
            // document.getElementById("var_name").value = data.input.var_name_input;
            // document.getElementById("var_value").value = data.input.var_value_input || "";
        } else {
            $('#var_input_div').removeClass('css');
            $('#var_input_div').css("display", "none");
        }
        document.getElementById("container_name_input").value = data.input.container_name_input || "";
        document.getElementById("container_name_output").value = data.output.container_name_output || "";
        document.getElementById("object_name_output").value = data.output.object_name_output || "";
    }
}

// This is called when the user has finished inline text-editing
function onTextEdited(e) {
    var tb = e.subject;
    if (tb === null || !tb.name) return;
    var node = tb.part;
    if (node instanceof go.Node) {
        updateProperties(node.data);
    }
}

// Update the data fields when the text is changed
function updateData() {
    var node = bioDiagram.selection.first();
    // maxSelectionCount = 1, so there can only be one Part in this collection
    var data = node.data;
    if (node instanceof go.Node && data !== null) {
        var model = bioDiagram.model;
        model.startTransaction("modified " + "name");
        console.log(data.name);
        model.setDataProperty(data, "name", $('#node-name').val());
        console.log(data.name);
        model.commitTransaction("modified " + "name");

        model.startTransaction("modified " + "desc");
        console.log(data.desc);
        model.setDataProperty(data, "desc", $('#node-desc').val());
        console.log(data.desc);
        model.commitTransaction("modified " + "desc");

        model.startTransaction("modified " + "image");
        console.log(data.image);
        model.setDataProperty(data, "image", JSON.parse($('#node-image').val()));
        console.log(data.image);
        model.commitTransaction("modified " + "image");

        model.startTransaction("modified " + "command");
        console.log(data.command);
        model.setDataProperty(data, "command", $('#node-command').val());
        console.log(data.command);
        model.commitTransaction("modified " + "command");

        model.startTransaction("modified " + "input");
        console.log($('#var_name').text());
        model.setDataProperty(data, "input", JSON.parse('{"var_name_input":"' + $('#var_name').text() + '","var_value_input":"' + $('#var_value').val() + '","container_name_input":"' + $('#container_name_input').val() + '"}'));
        console.log(data.input);
        model.commitTransaction("modified " + "input");

        model.startTransaction("modified " + "output");
        console.log(data.output);
        model.setDataProperty(data, "output", JSON.parse('{"container_name_output":"' + $('#container_name_output').val() + '","object_name_output":"' + $('#object_name_output').val() + '"}'));
        console.log(data.output);
        model.commitTransaction("modified " + "output");
    }
}


function TopRotatingTool() {
    go.RotatingTool.call(this);
}
go.Diagram.inherit(TopRotatingTool, go.RotatingTool);

/** @override */
TopRotatingTool.prototype.updateAdornments = function(part) {
    go.RotatingTool.prototype.updateAdornments.call(this, part);
    var adornment = part.findAdornment("Rotating");
    if (adornment !== null) {
        adornment.location = part.rotateObject.getDocumentPoint(new go.Spot(0.5, 0, 0, -30)); // above middle top
    }
};

/** @override */
TopRotatingTool.prototype.rotate = function(newangle) {
    go.RotatingTool.prototype.rotate.call(this, newangle + 90);
};
// end of TopRotatingTool class


// Show the diagram's model in JSON format that the user may edit
function save() {
    saveDiagramProperties(); // do this first, before writing to JSON
    document.getElementById("savedModel").value = bioDiagram.model.toJson();
    bioDiagram.isModified = false;
}

function load() {
    bioDiagram.model = go.Model.fromJson(document.getElementById("savedModel").value);
    // loadDiagramProperties gets called later, upon the "InitialLayoutCompleted" DiagramEvent
}

function saveDiagramProperties() {
    bioDiagram.model.modelData.position = go.Point.stringify(bioDiagram.position);
}
// Called by "InitialLayoutCompleted" DiagramEvent listener, NOT directly by load()!
function loadDiagramProperties(e) {
    var pos = bioDiagram.model.modelData.position;
    if (pos) bioDiagram.position = go.Point.parse(pos);
}

function commandParsing(text) {
    console.log("parsing:" + text);
    // var pos_start = text.indexOf("%(");
    var pos_start, pos_end;
    file_name_list = [];
    for (var i = 0; i < text.length; i++) {
        if (text[i] == "{") {
            pos_start = i;
        }
        if (text[i] == "}") {
            pos_end = i;
            var var_name = text.substring(pos_start + 1, pos_end);
            file_name_list.push(var_name);
        };
    };

    if (file_name_list.length > 0) {
        for (var i = 0; i < file_name_list.length; i++) {
            console.log(file_name_list[i]);
            $('#var_input_div').css("display", "block");
            $('#var_input_div').append('<label id="var_name_' + i + '">' + file_name_list[i] + '</label><input id="var_value_' + i + '" type="text"/><br/>')
            $('#node-output').css("display", "block");
        };
    };


    // if (pos_start != -1) {
    //     pos_end = text.indexOf(")s");

    //     console.log(var_name);

    // } else {
    //     $('#var_name').text("");
    //     $('#var_input_div').removeClass('css');
    //     $('#var_input_div').css("display", "none");
    // };
}